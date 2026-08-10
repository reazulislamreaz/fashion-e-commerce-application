import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { PrismaService } from '../src/database/prisma.service';

describe('Backend Hardening & Security (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let superAdminToken: string;
  const suffix = Date.now();

  let testCategoryId: string;
  let testStyleId: string;
  let testSizeId: string;

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
      throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set.');
    }

    const superLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: superAdminEmail, password: superAdminPassword })
      .expect(200);

    superAdminToken = superLogin.body.data.accessToken as string;
  });

  afterAll(async () => {
    // Clean up created entities
    if (testCategoryId) {
      await prisma.category.deleteMany({ where: { id: testCategoryId } });
    }
    if (testStyleId) {
      await prisma.style.deleteMany({ where: { id: testStyleId } });
    }
    if (testSizeId) {
      await prisma.size.deleteMany({ where: { id: testSizeId } });
    }

    await prisma.category.deleteMany({
      where: { name: { contains: `Hardening ${suffix}` } },
    });
    await prisma.style.deleteMany({
      where: { name: { contains: `Hardening ${suffix}` } },
    });
    await prisma.size.deleteMany({
      where: { name: { contains: `Hardening ${suffix}` } },
    });

    await app.close();
  });

  function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  describe('Health Check Endpoint', () => {
    it('returns 200 OK with healthy database status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Application is healthy');
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.database).toBe('up');
      expect(typeof response.body.data.uptime).toBe('number');
      expect(typeof response.body.data.timestamp).toBe('string');
    });
  });

  describe('Malformed Path Parameter Validation', () => {
    it('returns 400 Bad Request for non-UUID category ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/categories/not-a-valid-uuid')
        .set(auth(superAdminToken))
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.meta.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 Bad Request for non-UUID product ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products/invalid-uuid-format')
        .set(auth(superAdminToken))
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.meta.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 Bad Request for non-UUID order ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/orders/12345')
        .set(auth(superAdminToken))
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.meta.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Query Parameter Bounds & Edge Case Validation', () => {
    it('rejects page < 1 with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products')
        .set(auth(superAdminToken))
        .query({ page: 0 })
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/v1/categories')
        .set(auth(superAdminToken))
        .query({ page: -1 })
        .expect(400);
    });

    it('rejects limit > 100 with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products')
        .set(auth(superAdminToken))
        .query({ limit: 150 })
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set(auth(superAdminToken))
        .query({ limit: 500 })
        .expect(400);
    });

    it('rejects invalid enum filter values with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/orders')
        .set(auth(superAdminToken))
        .query({ status: 'INVALID_STATUS' })
        .expect(400);

      await request(app.getHttpServer())
        .get('/api/v1/products')
        .set(auth(superAdminToken))
        .query({ status: 'UNKNOWN' })
        .expect(400);
    });
  });

  describe('Case-Insensitive Catalog Name Uniqueness', () => {
    it('blocks duplicate category creation in different letter casing with 409 Conflict', async () => {
      const name = `Hardening Category ${suffix}`;
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(superAdminToken))
        .send({ name })
        .expect(201);
      testCategoryId = res1.body.data.id as string;

      // Attempt creating uppercase variant
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(superAdminToken))
        .send({ name: name.toUpperCase() })
        .expect(409);

      // Attempt creating lowercase variant
      await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set(auth(superAdminToken))
        .send({ name: name.toLowerCase() })
        .expect(409);
    });

    it('blocks duplicate style creation in different letter casing with 409 Conflict', async () => {
      const name = `Hardening Style ${suffix}`;
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(superAdminToken))
        .send({ name })
        .expect(201);
      testStyleId = res1.body.data.id as string;

      await request(app.getHttpServer())
        .post('/api/v1/styles')
        .set(auth(superAdminToken))
        .send({ name: name.toUpperCase() })
        .expect(409);
    });

    it('blocks duplicate size creation in different letter casing with 409 Conflict', async () => {
      const name = `Hardening Size ${suffix}`;
      const res1 = await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(superAdminToken))
        .send({ name, sortOrder: 1 })
        .expect(201);
      testSizeId = res1.body.data.id as string;

      await request(app.getHttpServer())
        .post('/api/v1/sizes')
        .set(auth(superAdminToken))
        .send({ name: name.toUpperCase() })
        .expect(409);
    });
  });

  describe('Consistent Error Response Format', () => {
    it('returns uniform error envelope structure on non-existent endpoints (404)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/non-existent-route-xyz')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data).toBeNull();
      expect(typeof response.body.meta.timestamp).toBe('string');
      expect(response.body.meta.path).toBe('/api/v1/non-existent-route-xyz');
    });
  });
});
