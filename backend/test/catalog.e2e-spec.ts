import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { RoleCode, UserStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { PrismaService } from '../src/database/prisma.service';

describe('Catalog management (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = Date.now();
  const password = 'SecurePass1';

  let superAdminToken: string;
  let adminToken: string;
  let managerToken: string;
  let customerToken: string;

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
        'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set for catalog e2e.',
      );
    }

    const superLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: superAdminEmail, password: superAdminPassword })
      .expect(200);
    superAdminToken = superLogin.body.data.accessToken as string;

    adminToken = await createUserAndLogin(RoleCode.ADMIN, 'admin');
    managerToken = await createUserAndLogin(RoleCode.MANAGER, 'manager');

    const customerEmail = `customer.${suffix}@example.com`;
    const customerReg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Catalog Customer',
        email: customerEmail,
        password,
      })
      .expect(201);
    customerToken = customerReg.body.data.accessToken as string;
  });

  afterAll(async () => {
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

  describe('Categories', () => {
    let categoryId: string;
    const categoryName = `Summer ${suffix}`;

    it('rejects unauthenticated create with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({ name: categoryName })
        .expect(401);
    });

    it('rejects customer and manager mutations with 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(customerToken))
        .send({ name: `${categoryName} Customer` })
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(managerToken))
        .send({ name: `${categoryName} Manager` })
        .expect(403);
    });

    it('creates a category as super admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(superAdminToken))
        .send({
          name: `  ${categoryName}  `,
          description: 'Seasonal apparel',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryName);
      categoryId = response.body.data.id as string;
    });

    it('creates a category as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: `Admin Cat ${suffix}` })
        .expect(201);

      expect(response.body.data.name).toBe(`Admin Cat ${suffix}`);
    });

    it('rejects invalid create payloads', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: 'A' })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: '   ' })
        .expect(400);
    });

    it('rejects duplicate names case-insensitively with 409', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: categoryName.toUpperCase() })
        .expect(409);

      expect(response.body.message).toMatch(/already exists/i);
    });

    it('lists, searches, filters, and paginates categories', async () => {
      const list = await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set(auth(customerToken))
        .query({ page: 1, limit: 5, search: 'Summer', sortBy: 'name' })
        .expect(200);

      expect(list.body.success).toBe(true);
      expect(Array.isArray(list.body.data)).toBe(true);
      expect(list.body.meta.pagination.page).toBe(1);
      expect(list.body.meta.pagination.limit).toBe(5);
      expect(list.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
      expect(
        list.body.data.some(
          (item: { name: string }) => item.name === categoryName,
        ),
      ).toBe(true);

      await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set(auth(customerToken))
        .query({ page: 0, limit: 20 })
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set(auth(customerToken))
        .query({ limit: 1000 })
        .expect(400);
    });

    it('gets a category by id and returns 404 for missing', async () => {
      const found = await request(app.getHttpServer())
        .get(`/api/v1/categories/${categoryId}`)
        .set(auth(customerToken))
        .expect(200);

      expect(found.body.data.id).toBe(categoryId);

      await request(app.getHttpServer())
        .get('/api/v1/categories/00000000-0000-4000-8000-000000000099')
        .set(auth(customerToken))
        .expect(404);

      await request(app.getHttpServer())
        .get('/api/v1/categories/not-a-uuid')
        .set(auth(customerToken))
        .expect(400);
    });

    it('updates a category and rejects duplicate rename', async () => {
      const otherName = `Winter ${suffix}`;
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: otherName })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/categories/${categoryId}`)
        .set(auth(adminToken))
        .send({ description: 'Updated description', isActive: false })
        .expect(200);

      expect(updated.body.data.description).toBe('Updated description');
      expect(updated.body.data.isActive).toBe(false);

      await request(app.getHttpServer())
        .patch(`/api/v1/categories/${categoryId}`)
        .set(auth(adminToken))
        .send({ name: otherName })
        .expect(409);

      await request(app.getHttpServer())
        .patch(`/api/v1/categories/${categoryId}`)
        .set(auth(adminToken))
        .send({ isActive: true })
        .expect(200);
    });

    it('deletes an unused category and conflicts when referenced', async () => {
      const disposable = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(adminToken))
        .send({ name: `Disposable Cat ${suffix}` })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/categories/${disposable.body.data.id}`)
        .set(auth(adminToken))
        .expect(200);

      const style = await prisma.style.create({
        data: { name: `Style For Cat FK ${suffix}` },
      });
      const product = await prisma.product.create({
        data: {
          name: `Product Cat FK ${suffix}`,
          description: 'FK protection check',
          price: 10,
          categoryId,
          styleId: style.id,
        },
      });

      const conflict = await request(app.getHttpServer())
        .delete(`/api/v1/categories/${categoryId}`)
        .set(auth(adminToken))
        .expect(409);

      expect(conflict.body.message).toMatch(/referenced/i);

      await prisma.product.delete({ where: { id: product.id } });
      await prisma.style.delete({ where: { id: style.id } });

      await request(app.getHttpServer())
        .delete(`/api/v1/categories/${categoryId}`)
        .set(auth(adminToken))
        .expect(200);
    });
  });

  describe('Sizes', () => {
    let sizeId: string;
    const sizeName = `XL-${suffix}`;

    it('enforces auth and RBAC on mutations', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .send({ name: sizeName })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(managerToken))
        .send({ name: sizeName })
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(customerToken))
        .send({ name: sizeName })
        .expect(403);
    });

    it('supports full size CRUD with search and pagination', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(superAdminToken))
        .send({ name: sizeName, sortOrder: 40 })
        .expect(201);

      sizeId = created.body.data.id as string;
      expect(created.body.data.sortOrder).toBe(40);

      await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(adminToken))
        .send({ name: sizeName.toLowerCase() })
        .expect(409);

      const list = await request(app.getHttpServer())
        .get('/api/v1/sizes')
        .set(auth(customerToken))
        .query({ search: 'XL', sortBy: 'sortOrder', page: 1, limit: 10 })
        .expect(200);

      expect(list.body.meta.pagination.limit).toBe(10);
      expect(
        list.body.data.some((item: { id: string }) => item.id === sizeId),
      ).toBe(true);

      const found = await request(app.getHttpServer())
        .get(`/api/v1/sizes/${sizeId}`)
        .set(auth(customerToken))
        .expect(200);
      expect(found.body.data.name).toBe(sizeName);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/sizes/${sizeId}`)
        .set(auth(adminToken))
        .send({ sortOrder: 45, isActive: false })
        .expect(200);
      expect(updated.body.data.sortOrder).toBe(45);
      expect(updated.body.data.isActive).toBe(false);

      await request(app.getHttpServer())
        .delete(`/api/v1/sizes/${sizeId}`)
        .set(auth(adminToken))
        .expect(200);
    });

    it('returns 409 when deleting a size referenced by products', async () => {
      const size = await prisma.size.create({
        data: { name: `Referenced Size ${suffix}`, sortOrder: 99 },
      });
      const category = await prisma.category.create({
        data: { name: `Cat For Size FK ${suffix}` },
      });
      const style = await prisma.style.create({
        data: { name: `Style For Size FK ${suffix}` },
      });
      const product = await prisma.product.create({
        data: {
          name: `Product Size FK ${suffix}`,
          description: 'FK protection check',
          price: 20,
          categoryId: category.id,
          styleId: style.id,
        },
      });
      await prisma.productSize.create({
        data: { productId: product.id, sizeId: size.id },
      });

      const conflict = await request(app.getHttpServer())
        .delete(`/api/v1/sizes/${size.id}`)
        .set(auth(adminToken))
        .expect(409);
      expect(conflict.body.message).toMatch(/referenced/i);

      await prisma.productSize.deleteMany({ where: { sizeId: size.id } });
      await prisma.product.delete({ where: { id: product.id } });
      await prisma.style.delete({ where: { id: style.id } });
      await prisma.category.delete({ where: { id: category.id } });
      await prisma.size.delete({ where: { id: size.id } });
    });
  });

  describe('Styles', () => {
    let styleId: string;
    const styleName = `Casual ${suffix}`;

    it('enforces auth and RBAC on mutations', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/styles')
        .send({ name: styleName })
        .expect(401);

      await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(managerToken))
        .send({ name: styleName })
        .expect(403);

      await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(customerToken))
        .send({ name: styleName })
        .expect(403);
    });

    it('supports full style CRUD with search and pagination', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(superAdminToken))
        .send({ name: `  ${styleName}  `, description: 'Everyday wear' })
        .expect(201);

      styleId = created.body.data.id as string;
      expect(created.body.data.name).toBe(styleName);

      await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(adminToken))
        .send({ name: styleName.toUpperCase() })
        .expect(409);

      const list = await request(app.getHttpServer())
        .get('/api/v1/styles')
        .set(auth(customerToken))
        .query({ search: 'Casual', status: 'active', page: 1, limit: 10 })
        .expect(200);

      expect(
        list.body.data.some((item: { id: string }) => item.id === styleId),
      ).toBe(true);

      await request(app.getHttpServer())
        .get(`/api/v1/styles/${styleId}`)
        .set(auth(customerToken))
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/styles/00000000-0000-4000-8000-000000000088')
        .set(auth(customerToken))
        .expect(404);

      const updated = await request(app.getHttpServer())
        .patch(`/api/v1/styles/${styleId}`)
        .set(auth(adminToken))
        .send({ description: 'Updated style' })
        .expect(200);
      expect(updated.body.data.description).toBe('Updated style');

      await request(app.getHttpServer())
        .delete(`/api/v1/styles/${styleId}`)
        .set(auth(adminToken))
        .expect(200);
    });

    it('returns 409 when deleting a style referenced by products', async () => {
      const style = await prisma.style.create({
        data: { name: `Referenced Style ${suffix}` },
      });
      const category = await prisma.category.create({
        data: { name: `Cat For Style FK ${suffix}` },
      });
      const product = await prisma.product.create({
        data: {
          name: `Product Style FK ${suffix}`,
          description: 'FK protection check',
          price: 30,
          categoryId: category.id,
          styleId: style.id,
        },
      });

      const conflict = await request(app.getHttpServer())
        .delete(`/api/v1/styles/${style.id}`)
        .set(auth(adminToken))
        .expect(409);
      expect(conflict.body.message).toMatch(/referenced/i);

      await prisma.product.delete({ where: { id: product.id } });
      await prisma.category.delete({ where: { id: category.id } });
      await prisma.style.delete({ where: { id: style.id } });
    });
  });
});
