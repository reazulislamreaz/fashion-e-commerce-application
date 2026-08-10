import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { RoleCode, UserStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import { PrismaService } from '../src/database/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const suffix = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    const customerRole = await prisma.role.findUnique({
      where: { code: RoleCode.CUSTOMER },
    });
    if (!customerRole) {
      throw new Error('Customer role missing. Run pnpm prisma:seed first.');
    }
  });

  afterAll(async () => {
    await app.close();
  });

  function uniqueEmail(label: string): string {
    return `${label}.${suffix}@example.com`;
  }

  it('registers a customer with hashed password and returns tokens', async () => {
    const email = uniqueEmail('register');

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Jane Customer',
        email,
        phone: '+8801712345678',
        password: 'SecurePass1',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user.role.code).toBe(RoleCode.CUSTOMER);
    expect(response.body.data.user.role.name).toBe('Customer');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(response.body)).not.toContain('SecurePass1');

    const stored = await prisma.user.findUnique({ where: { email } });
    expect(stored?.passwordHash).toBeDefined();
    expect(stored?.passwordHash).not.toBe('SecurePass1');
    expect(stored?.passwordHash?.startsWith('$2')).toBe(true);
  });

  it('rejects client-supplied privileged role during registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Role Attacker',
        email: uniqueEmail('roleattack'),
        password: 'SecurePass1',
        role: 'SUPER_ADMIN',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('rejects duplicate email registration with 409', async () => {
    const email = uniqueEmail('duplicate');

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'First User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Second User',
        email,
        password: 'SecurePass1',
      })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/already exists/i);
  });

  it('rejects invalid registration payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Bad Email',
        email: 'not-an-email',
        password: 'SecurePass1',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Short Password',
        email: uniqueEmail('shortpass'),
        password: 'abc',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail('missingname'),
        password: 'SecurePass1',
      })
      .expect(400);
  });

  it('allows registration without phone', async () => {
    const email = uniqueEmail('nophone');

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'No Phone',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    expect(response.body.data.user.phone).toBeNull();
  });

  it('logs in successfully and rejects invalid credentials generically', async () => {
    const email = uniqueEmail('login');

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Login User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'SecurePass1' })
      .expect(200);

    expect(login.body.data.accessToken).toBeDefined();
    expect(login.body.data.refreshToken).toBeDefined();

    const invalid = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPass1' })
      .expect(401);

    expect(invalid.body.message).toBe('Invalid email or password.');

    const unknown = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: uniqueEmail('missing'), password: 'SecurePass1' })
      .expect(401);

    expect(unknown.body.message).toBe('Invalid email or password.');
  });

  it('rejects inactive users on login and /me', async () => {
    const email = uniqueEmail('inactive');

    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Inactive User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    await prisma.user.update({
      where: { email },
      data: { status: UserStatus.INACTIVE },
    });

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'SecurePass1' })
      .expect(401);

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registered.body.data.accessToken}`)
      .expect(401);
  });

  it('returns current user for valid access token and rejects missing/invalid tokens', async () => {
    const email = uniqueEmail('me');

    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Profile User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registered.body.data.accessToken}`)
      .expect(200);

    expect(me.body.data.email).toBe(email);
    expect(me.body.data.passwordHash).toBeUndefined();

    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.value')
      .expect(401);
  });

  it('refreshes tokens with rotation and rejects reused refresh tokens', async () => {
    const email = uniqueEmail('refresh');

    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Refresh User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    const oldRefresh = registered.body.data.refreshToken as string;

    const refreshed = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefresh })
      .expect(200);

    expect(refreshed.body.data.accessToken).toBeDefined();
    expect(refreshed.body.data.refreshToken).toBeDefined();
    expect(refreshed.body.data.refreshToken).not.toBe(oldRefresh);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: oldRefresh })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not-a-valid-token' })
      .expect(401);
  });

  it('logs out and prevents refresh-token reuse', async () => {
    const email = uniqueEmail('logout');

    const registered = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Logout User',
        email,
        password: 'SecurePass1',
      })
      .expect(201);

    const accessToken = registered.body.data.accessToken as string;
    const refreshToken = registered.body.data.refreshToken as string;

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
