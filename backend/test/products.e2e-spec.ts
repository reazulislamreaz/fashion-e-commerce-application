import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { RoleCode, UserStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { PrismaService } from '../src/database/prisma.service';

describe('Product management (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = Date.now();
  const password = 'SecurePass1';

  let superAdminToken: string;
  let adminToken: string;
  let managerToken: string;
  let customerToken: string;

  let activeCategoryId: string;
  let inactiveCategoryId: string;
  let activeStyleId: string;
  let inactiveStyleId: string;
  let activeSizeId1: string;
  let activeSizeId2: string;
  let inactiveSizeId: string;

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
        'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set for products e2e.',
      );
    }

    const superLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: superAdminEmail, password: superAdminPassword })
      .expect(200);
    superAdminToken = superLogin.body.data.accessToken as string;

    adminToken = await createUserAndLogin(RoleCode.ADMIN, 'prodadmin');
    managerToken = await createUserAndLogin(RoleCode.MANAGER, 'prodmanager');

    const customerEmail = `prodcustomer.${suffix}@example.com`;
    const customerReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Product Customer',
        email: customerEmail,
        password,
      })
      .expect(201);
    customerToken = customerReg.body.data.accessToken as string;

    // Seed test categories
    const activeCategory = await prisma.category.create({
      data: { name: `Active Cat ${suffix}`, description: 'Active test category' },
    });
    activeCategoryId = activeCategory.id;

    const inactiveCategory = await prisma.category.create({
      data: {
        name: `Inactive Cat ${suffix}`,
        description: 'Inactive test category',
        isActive: false,
      },
    });
    inactiveCategoryId = inactiveCategory.id;

    // Seed test styles
    const activeStyle = await prisma.style.create({
      data: { name: `Active Style ${suffix}`, description: 'Active test style' },
    });
    activeStyleId = activeStyle.id;

    const inactiveStyle = await prisma.style.create({
      data: {
        name: `Inactive Style ${suffix}`,
        description: 'Inactive test style',
        isActive: false,
      },
    });
    inactiveStyleId = inactiveStyle.id;

    // Seed test sizes
    const activeSize1 = await prisma.size.create({
      data: { name: `Size-S-${suffix}`, sortOrder: 10 },
    });
    activeSizeId1 = activeSize1.id;

    const activeSize2 = await prisma.size.create({
      data: { name: `Size-M-${suffix}`, sortOrder: 20 },
    });
    activeSizeId2 = activeSize2.id;

    const inactiveSize = await prisma.size.create({
      data: { name: `Size-OFF-${suffix}`, sortOrder: 99, isActive: false },
    });
    inactiveSizeId = inactiveSize.id;
  });

  afterAll(async () => {
    // Clean up created catalog test entities
    await prisma.productSize.deleteMany({
      where: { sizeId: { in: [activeSizeId1, activeSizeId2, inactiveSizeId] } },
    });
    await prisma.product.deleteMany({
      where: {
        categoryId: { in: [activeCategoryId, inactiveCategoryId] },
      },
    });
    await prisma.size.deleteMany({
      where: { id: { in: [activeSizeId1, activeSizeId2, inactiveSizeId] } },
    });
    await prisma.style.deleteMany({
      where: { id: { in: [activeStyleId, inactiveStyleId] } },
    });
    await prisma.category.deleteMany({
      where: { id: { in: [activeCategoryId, inactiveCategoryId] } },
    });

    await app.close();
  });

  async function createUserAndLogin(
    roleCode: RoleCode,
    label: string,
  ): Promise<string> {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) {
      throw new Error(`Role ${roleCode} missing. Run pnpm prisma:seed first.`);
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

  describe('Product Mutations Security & RBAC', () => {
    const sampleProductPayload = () => ({
      name: `Denim Jacket ${suffix}`,
      description: 'Classic blue denim jacket',
      price: 89.99,
      categoryId: activeCategoryId,
      styleId: activeStyleId,
      sizeIds: [activeSizeId1],
      images: [
        { url: 'https://example.com/denim-front.jpg', isPrimary: true },
      ],
    });

    it('rejects unauthenticated create with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(sampleProductPayload())
        .expect(401);
    });

    it('rejects customer and manager create with 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(customerToken))
        .send(sampleProductPayload())
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(managerToken))
        .send(sampleProductPayload())
        .expect(403);
    });

    it('rejects customer and manager update/delete with 403', async () => {
      const dummyId = '00000000-0000-4000-8000-000000000001';

      await request(app.getHttpServer())
        .patch(`/api/v1/products/${dummyId}`)
        .set(auth(customerToken))
        .send({ name: 'New Name' })
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/api/v1/products/${dummyId}`)
        .set(auth(managerToken))
        .expect(403);
    });
  });

  describe('Product Input Validation', () => {
    it('rejects missing or invalid payload fields', async () => {
      // Invalid price (< 0)
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Valid Name',
          description: 'Valid Desc',
          price: -10,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Empty sizeIds array
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Valid Name',
          description: 'Valid Desc',
          price: 50,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Duplicate sizeIds
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Valid Name',
          description: 'Valid Desc',
          price: 50,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1, activeSizeId1],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Empty images array
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Valid Name',
          description: 'Valid Desc',
          price: 50,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [],
        })
        .expect(400);
    });

    it('rejects nonexistent or inactive category/style/size references', async () => {
      const nonExistentId = '00000000-0000-4000-8000-999999999999';

      // Nonexistent category
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Invalid Cat Product',
          description: 'Desc',
          price: 49.99,
          categoryId: nonExistentId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Inactive category
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Inactive Cat Product',
          description: 'Desc',
          price: 49.99,
          categoryId: inactiveCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Inactive style
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Inactive Style Product',
          description: 'Desc',
          price: 49.99,
          categoryId: activeCategoryId,
          styleId: inactiveStyleId,
          sizeIds: [activeSizeId1],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);

      // Inactive size
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Inactive Size Product',
          description: 'Desc',
          price: 49.99,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [inactiveSizeId],
          images: [{ url: 'https://example.com/img.jpg' }],
        })
        .expect(400);
    });

    it('rejects multiple primary images', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: 'Multi Primary Product',
          description: 'Desc',
          price: 49.99,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [
            { url: 'https://example.com/img1.jpg', isPrimary: true },
            { url: 'https://example.com/img2.jpg', isPrimary: true },
          ],
        })
        .expect(400);
    });
  });

  describe('Product CRUD & Query Features', () => {
    let productId: string;
    const productName = `Cotton Polo Shirt ${suffix}`;

    it('creates a product as Super Admin and auto-sets first image as primary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(superAdminToken))
        .send({
          name: `  ${productName}  `,
          description: 'Breathable polo shirt for summer',
          price: 34.5,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1, activeSizeId2],
          images: [
            { url: 'https://example.com/polo-front.jpg', sortOrder: 1 },
            { url: 'https://example.com/polo-back.jpg', sortOrder: 2 },
          ],
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productName);
      expect(Number(response.body.data.price)).toBe(34.5);
      expect(response.body.data.category.id).toBe(activeCategoryId);
      expect(response.body.data.style.id).toBe(activeStyleId);
      expect(response.body.data.productSizes).toHaveLength(2);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.images[0].isPrimary).toBe(true);

      productId = response.body.data.id as string;
    });

    it('creates a second product as Admin', async () => {
      const secondProduct = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: `Silk Scarf ${suffix}`,
          description: 'Luxurious silk scarf',
          price: 120.0,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [
            { url: 'https://example.com/scarf.jpg', isPrimary: true },
          ],
        })
        .expect(201);

      expect(secondProduct.body.data.name).toBe(`Silk Scarf ${suffix}`);
    });

    it('lists, searches, filters, and paginates products', async () => {
      // Customer token can list products
      const list = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set(auth(customerToken))
        .query({
          search: 'Polo',
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeId: activeSizeId1,
          status: 'active',
          page: 1,
          limit: 10,
          sortBy: 'price',
          sortOrder: 'asc',
        })
        .expect(200);

      expect(list.body.success).toBe(true);
      expect(Array.isArray(list.body.data)).toBe(true);
      expect(list.body.meta.pagination.page).toBe(1);
      expect(list.body.meta.pagination.limit).toBe(10);
      expect(list.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
      expect(
        list.body.data.some((p: { id: string }) => p.id === productId),
      ).toBe(true);
    });

    it('gets a product by ID and returns 404 for missing', async () => {
      const found = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set(auth(customerToken))
        .expect(200);

      expect(found.body.data.id).toBe(productId);
      expect(found.body.data.name).toBe(productName);

      await request(app.getHttpServer())
        .get('/api/v1/products/00000000-0000-4000-8000-000000000099')
        .set(auth(customerToken))
        .expect(404);
    });

    it('updates a product partially with new sizeIds and images as Admin', async () => {
      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}`)
        .set(auth(adminToken))
        .send({
          price: 39.99,
          description: 'Updated premium polo description',
          sizeIds: [activeSizeId2],
          images: [
            { url: 'https://example.com/polo-updated.jpg', isPrimary: true },
          ],
        })
        .expect(200);

      expect(Number(updated.body.data.price)).toBe(39.99);
      expect(updated.body.data.description).toBe(
        'Updated premium polo description',
      );
      expect(updated.body.data.productSizes).toHaveLength(1);
      expect(updated.body.data.productSizes[0].size.id).toBe(activeSizeId2);
      expect(updated.body.data.images).toHaveLength(1);
      expect(updated.body.data.images[0].url).toBe(
        'https://example.com/polo-updated.jpg',
      );
    });

    it('deletes an unused product and enforces referential integrity on order references', async () => {
      // Disposable product deletion
      const disposable = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set(auth(adminToken))
        .send({
          name: `Disposable Product ${suffix}`,
          description: 'Temporary product',
          price: 15.0,
          categoryId: activeCategoryId,
          styleId: activeStyleId,
          sizeIds: [activeSizeId1],
          images: [{ url: 'https://example.com/disposable.jpg' }],
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/products/${disposable.body.data.id}`)
        .set(auth(adminToken))
        .expect(200);

      // Verify FK restrict when referenced in an OrderItem
      const customer = await prisma.user.findFirst({
        where: { email: `prodcustomer.${suffix}@example.com` },
      });
      if (!customer) {
        throw new Error('Test customer missing');
      }

      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          customerName: 'Test Customer',
          phoneNumber: '123456789',
          shippingAddress: '123 Test St',
          totalAmount: 39.99,
          items: {
            create: {
              productId: productId,
              quantity: 1,
              unitPrice: 39.99,
              subtotal: 39.99,
            },
          },
        },
      });

      const conflict = await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .set(auth(adminToken))
        .expect(409);

      expect(conflict.body.message).toMatch(/referenced by orders/i);

      // Clean up test order and items
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });

      // Now product deletion succeeds
      await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .set(auth(adminToken))
        .expect(200);
    });
  });
});
