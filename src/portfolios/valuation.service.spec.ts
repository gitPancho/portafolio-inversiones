import { Test, TestingModule } from '@nestjs/testing';
import { ValuationService } from './valuation.service';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from './portfolios.service';

describe('ValuationService', () => {
  let service: ValuationService;
  let prisma: { asset: { findMany: jest.Mock } };
  let portfoliosService: { findOneOrThrow: jest.Mock };

  beforeEach(async () => {
    prisma = { asset: { findMany: jest.fn() } };
    portfoliosService = {
      findOneOrThrow: jest.fn().mockResolvedValue({ id: 'p1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValuationService,
        { provide: PrismaService, useValue: prisma },
        { provide: PortfoliosService, useValue: portfoliosService },
      ],
    }).compile();

    service = module.get(ValuationService);
  });

  it('calcula costo promedio, valor de mercado y rendimiento tras una compra y una venta parcial', async () => {
    prisma.asset.findMany.mockResolvedValue([
      {
        id: 'asset-1',
        symbol: 'AAPL',
        name: 'Apple',
        currentPrice: 250,
        transactions: [
          { type: 'BUY', quantity: 10, price: 200 },
          { type: 'BUY', quantity: 10, price: 220 },
          { type: 'SELL', quantity: 5, price: 260 },
        ],
      },
    ]);

    const valuation = await service.getPortfolioValuation('user-1', 'p1');

    expect(valuation.assets[0]).toMatchObject({
      quantity: 15,
      averageCost: 210,
      costBasis: 3150,
      marketValue: 3750,
      gainLoss: 600,
    });
    expect(valuation.totalMarketValue).toBe(3750);
    expect(valuation.totalGainLossPercent).toBeCloseTo(19.05, 1);
  });

  it('retorna cero cuando el activo no tiene transacciones', async () => {
    prisma.asset.findMany.mockResolvedValue([
      {
        id: 'asset-1',
        symbol: 'MSFT',
        name: null,
        currentPrice: 400,
        transactions: [],
      },
    ]);

    const valuation = await service.getPortfolioValuation('user-1', 'p1');

    expect(valuation.assets[0].quantity).toBe(0);
    expect(valuation.totalMarketValue).toBe(0);
    expect(valuation.totalGainLossPercent).toBe(0);
  });
});
