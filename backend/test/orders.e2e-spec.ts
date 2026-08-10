import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { OrderStatus, RoleCode, UserStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { PrismaService } from '../src/database/prisma.service';

describe('Order management (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = Date.now();
  const password = 'SecurePass1';

  let superAdminToken: string;
  let managerToken: string;
  let customerAToken: string;
  let customerBToken: string;
  let customerAId: string;

  let activeCategoryId: string;
  let activeStyleId: string;

  let product1Id: string;
  let product2Id: string;
  let inactiveProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    if (!superAdminEmail || !superAdminPassword) {
      throw new Error(
        'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set for orders e2e.',
      );
    }

    const superLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: superAdminEmail, password: superAdminPassword })
      .expect(200);
    superAdminToken = superLogin.body.data.accessToken as string;

    managerToken = await createUserAndLogin(RoleCode.MANAGER, 'ordmanager');

    // Create Customer A
    const custAEmail = `ordcustomerA.${suffix}@example.com`;
    const custAReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Order Customer A',
        email: custAEmail,
        password,
      })
      .expect(201);
    customerAToken = custAReg.body.data.accessToken as string;
    customerAId = custAReg.body.data.user.id as string;

    // Create Customer B
    const custBEmail = `ordcustomerB.${suffix}@example.com`;
    const custBReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Order Customer B',
        email: custBEmail,
        password,
      })
      .expect(201);
    customerBToken = custBReg.body.data.accessToken as string;

    // Create seed catalog records for orders
    const category = await prisma.category.create({
      data: { name: `Order Test Category ${suffix}` },
    });
    activeCategoryId = category.id;

    const style = await prisma.style.create({
      data: { name: `Order Test Style ${suffix}` },
    });
    activeStyleId = style.id;

    // Create products
    const prod1 = await prisma.product.create({
      data: {
        name: `Order Jacket ${suffix}`,
        description: 'Quality jacket',
        price: 50.0,
        categoryId: activeCategoryId,
        styleId: activeStyleId,
      },
    });
    product1Id = prod1.id;

    const prod2 = await prisma.product.create({
      data: {
        name: `Order Shirt ${suffix}`,
        description: 'Cotton shirt',
        price: 30.0,
        categoryId: activeCategoryId,
        styleId: activeStyleId,
      },
    });
    product2Id = prod2.id;

    const prodInactive = await prisma.product.create({
      data: {
        name: `Order Inactive ${suffix}`,
        description: 'Inactive product',
        price: 99.0,
        categoryId: activeCategoryId,
        styleId: activeStyleId,
        isActive: false,
      },
    });
    inactiveProductId = prodInactive.id;
  });

  afterAll(async () => {
    // Clean up created orders & catalog test entities
    await prisma.orderItem.deleteMany({
      where: {
        productId: { in: [product1Id, product2Id, inactiveProductId] },
      },
    });
    await prisma.order.deleteMany({
      where: {
        user: {
          email: {
            in: [
              `ordcustomerA.${suffix}@example.com`,
              `ordcustomerB.${suffix}@example.com`,
            ],
          },
        },
      },
    });
    await prisma.product.deleteMany({
      where: { id: { in: [product1Id, product2Id, inactiveProductId] } },
    });
    await prisma.style.delete({ where: { id: activeStyleId } });
    await prisma.category.delete({ where: { id: activeCategoryId } });

    await app.close();
  });

  async function createUserAndLogin(
    roleCode: RoleCode,
    label: string,
  ): Promise<string> {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) {
      throw new Error(`Role ${roleCode} missing.`);
    }

    const email = `${label}.${suffix}@example.com`;
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        fullName: `${label} User`,
        email,
        passwordHash,
        status: UserStatus.ACTIVE,
        roleId: role.id,
      },
    });

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    return login.body.data.accessToken as string;
  }

  function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  describe('Order API Security & Role Restrictions', () => {
    it('rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          items: [{ productId: product1Id, quantity: 1 }],
        })
        .expect(401);

      await request(app.getHttpServer()).get('/api/v1/orders').expect(401);
    });

    it('prevents customer from updating order status with 403', async () => {
      const dummyId = '00000000-0000-4000-8000-000000000001';
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${dummyId}/status`)
        .set(auth(customerAToken))
        .send({ status: OrderStatus.CONFIRMED })
        .expect(403);
    });
  });

  describe('Order Creation & Server-Side Price Calculation', () => {
    it('rejects invalid inputs and client price manipulation', async () => {
      // Empty items array
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          items: [],
        })
        .expect(400);

      // Non-positive quantity
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          items: [{ productId: product1Id, quantity: 0 }],
        })
        .expect(400);

      // Duplicate product IDs
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          items: [
            { productId: product1Id, quantity: 1 },
            { productId: product1Id, quantity: 2 },
          ],
        })
        .expect(400);

      // Inactive product
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          items: [{ productId: inactiveProductId, quantity: 1 }],
        })
        .expect(400);

      // Client attempting to send fake price / total (forbidNonWhitelisted rejects extra properties)
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'John Doe',
          phoneNumber: '123456789',
          shippingAddress: '123 Street',
          totalAmount: 1.0, // Extra non-whitelisted property
          items: [{ productId: product1Id, quantity: 1, unitPrice: 1.0 }],
        })
        .expect(400);
    });

    it('creates an order with server-calculated total (2 x $50 + 1 x $30 = $130)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'Customer A',
          phoneNumber: '+8801700000000',
          shippingAddress: 'House 12, Road 5, Dhaka',
          items: [
            { productId: product1Id, quantity: 2 },
            { productId: product2Id, quantity: 1 },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe('Customer A');
      expect(response.body.data.phoneNumber).toBe('+8801700000000');
      expect(response.body.data.shippingAddress).toBe(
        'House 12, Road 5, Dhaka',
      );
      expect(response.body.data.status).toBe(OrderStatus.PENDING);
      expect(Number(response.body.data.totalAmount)).toBe(130.0);
      expect(response.body.data.items).toHaveLength(2);

      const item1 = response.body.data.items.find(
        (i: { productId: string }) => i.productId === product1Id,
      );
      expect(Number(item1.unitPrice)).toBe(50.0);
      expect(Number(item1.subtotal)).toBe(100.0);

      const item2 = response.body.data.items.find(
        (i: { productId: string }) => i.productId === product2Id,
      );
      expect(Number(item2.unitPrice)).toBe(30.0);
      expect(Number(item2.subtotal)).toBe(30.0);
    });
  });

  describe('Customer Ownership Isolation & Management List/Details', () => {
    let orderAId: string;
    let orderBId: string;

    beforeAll(async () => {
      // Order A placed by Customer A
      const resA = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'Customer A',
          phoneNumber: '1111111111',
          shippingAddress: 'Address A',
          items: [{ productId: product1Id, quantity: 1 }],
        })
        .expect(201);
      orderAId = resA.body.data.id as string;

      // Order B placed by Customer B
      const resB = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerBToken))
        .send({
          customerName: 'Customer B',
          phoneNumber: '2222222222',
          shippingAddress: 'Address B',
          items: [{ productId: product2Id, quantity: 1 }],
        })
        .expect(201);
      orderBId = resB.body.data.id as string;
    });

    it('ensures Customer A only sees own orders and cannot view Customer B order details', async () => {
      // List customer A orders
      const listA = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set(auth(customerAToken))
        .expect(200);

      const orderIdsA = listA.body.data.map((o: { id: string }) => o.id);
      expect(orderIdsA).toContain(orderAId);
      expect(orderIdsA).not.toContain(orderBId);

      // Customer A views Order A details
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderAId}`)
        .set(auth(customerAToken))
        .expect(200);

      // Customer A attempts to view Order B details -> 404 Not Found (Ownership isolation)
      await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderBId}`)
        .set(auth(customerAToken))
        .expect(404);
    });

    it('allows Management user to view all orders and filter by status/user', async () => {
      const mgmtList = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set(auth(managerToken))
        .query({ userId: customerAId, status: OrderStatus.PENDING })
        .expect(200);

      expect(mgmtList.body.success).toBe(true);
      expect(
        mgmtList.body.data.every(
          (o: { userId: string }) => o.userId === customerAId,
        ),
      ).toBe(true);

      // Manager views Customer B order details
      const orderBDetails = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderBId}`)
        .set(auth(managerToken))
        .expect(200);

      expect(orderBDetails.body.data.id).toBe(orderBId);
    });
  });

  describe('Order Status Transitions & Historical Price Snapshots', () => {
    let testOrderId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set(auth(customerAToken))
        .send({
          customerName: 'Status Customer',
          phoneNumber: '999999999',
          shippingAddress: 'Status Address',
          items: [{ productId: product1Id, quantity: 2 }],
        })
        .expect(201);
      testOrderId = res.body.data.id as string;
    });

    it('executes valid status transition sequence PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED', async () => {
      // PENDING -> CONFIRMED
      const confirmed = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(managerToken))
        .send({ status: OrderStatus.CONFIRMED })
        .expect(200);
      expect(confirmed.body.data.status).toBe(OrderStatus.CONFIRMED);

      // CONFIRMED -> PROCESSING
      const processing = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(superAdminToken))
        .send({ status: OrderStatus.PROCESSING })
        .expect(200);
      expect(processing.body.data.status).toBe(OrderStatus.PROCESSING);

      // PROCESSING -> SHIPPED
      const shipped = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(managerToken))
        .send({ status: OrderStatus.SHIPPED })
        .expect(200);
      expect(shipped.body.data.status).toBe(OrderStatus.SHIPPED);

      // SHIPPED -> DELIVERED
      const delivered = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(managerToken))
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);
      expect(delivered.body.data.status).toBe(OrderStatus.DELIVERED);
    });

    it('rejects invalid status transitions from terminal DELIVERED state', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(managerToken))
        .send({ status: OrderStatus.PENDING })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${testOrderId}/status`)
        .set(auth(managerToken))
        .send({ status: OrderStatus.CANCELLED })
        .expect(400);
    });

    it('preserves historical unitPrice snapshot when product price changes later', async () => {
      // Product 1 original price was $50.00. Order has unitPrice = $50.00
      // Now update Product 1 price in database to $150.00
      await prisma.product.update({
        where: { id: product1Id },
        data: { price: 150.0 },
      });

      // Retrieve existing order
      const fetchedOrder = await request(app.getHttpServer())
        .get(`/api/v1/orders/${testOrderId}`)
        .set(auth(customerAToken))
        .expect(200);

      // Historical order unit price must still be 50.00 (not 150.00)
      const lineItem = fetchedOrder.body.data.items[0];
      expect(Number(lineItem.unitPrice)).toBe(50.0);
      expect(Number(lineItem.subtotal)).toBe(100.0);
      expect(Number(fetchedOrder.body.data.totalAmount)).toBe(100.0);
    });
  });
});
