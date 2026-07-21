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

interface PortfolioResponse {
  id: string;
}

interface AssetResponse {
  id: string;
  symbol: string;
}

interface ValuationResponse {
  assets: { quantity: number; averageCost: number; marketValue: number }[];
}

describe('Portfolio CRUD (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let server: App;
  const email = `crud-e2e-${Date.now()}@example.com`;
  const password = 'password123';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    server = app.getHttpServer();

    prisma = moduleFixture.get(PrismaService);

    const register = await request(server)
      .post('/auth/register')
      .send({ email, password });
    accessToken = (register.body as AuthTokens).accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('crea un portafolio, agrega un activo, registra transacciones y calcula la valorización', async () => {
    const portfolioResponse = await request(server)
      .post('/portfolios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Portafolio e2e' })
      .expect(201);
    const portfolioId = (portfolioResponse.body as PortfolioResponse).id;

    const assetResponse = await request(server)
      .post(`/portfolios/${portfolioId}/assets`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ symbol: 'aapl', currentPrice: 250 })
      .expect(201);
    const asset = assetResponse.body as AssetResponse;
    expect(asset.symbol).toBe('AAPL');

    await request(server)
      .post(`/portfolios/${portfolioId}/assets/${asset.id}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'BUY', quantity: 10, price: 200 })
      .expect(201);

    await request(server)
      .post(`/portfolios/${portfolioId}/assets/${asset.id}/transactions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'SELL', quantity: 4, price: 260 })
      .expect(201);

    const valuation = await request(server)
      .get(`/portfolios/${portfolioId}/valuation`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const valuationBody = valuation.body as ValuationResponse;
    expect(valuationBody.assets[0]).toMatchObject({
      quantity: 6,
      averageCost: 200,
      marketValue: 1500,
    });
  });

  it('impide que otro usuario vea o modifique el portafolio', async () => {
    const otherEmail = `crud-e2e-other-${Date.now()}@example.com`;
    const otherRegister = await request(server)
      .post('/auth/register')
      .send({ email: otherEmail, password });
    const otherToken = (otherRegister.body as AuthTokens).accessToken;

    const myPortfolio = await request(server)
      .post('/portfolios')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Portafolio privado' });
    const myPortfolioId = (myPortfolio.body as PortfolioResponse).id;

    await request(server)
      .get(`/portfolios/${myPortfolioId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    await prisma.user.deleteMany({ where: { email: otherEmail } });
  });
});
