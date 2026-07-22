import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const email = `auth-e2e-${Date.now()}@example.com`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registra un usuario nuevo y retorna tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const body = response.body as AuthTokens;
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('rechaza el registro duplicado', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(409);
  });

  it('permite hacer login con credenciales validas', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const body = response.body as AuthTokens;
    expect(body.accessToken).toBeDefined();
  });

  it('rechaza el login con password incorrecta', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'incorrecta' })
      .expect(401);
  });

  it('rechaza acceso a rutas protegidas sin token', () => {
    return request(app.getHttpServer()).get('/portfolios').expect(401);
  });

  it('renueva los tokens usando el refresh token', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const loginBody = login.body as AuthTokens;
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${loginBody.refreshToken}`)
      .expect(200);

    const body = response.body as AuthTokens;
    expect(body.accessToken).toBeDefined();
  });
});
