import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PortfoliosService', () => {
  let service: PortfoliosService;
  let prisma: {
    portfolio: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      portfolio: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfoliosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PortfoliosService);
  });

  it('crea un portafolio asociado al usuario', async () => {
    prisma.portfolio.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'p1', ...data }),
    );

    const portfolio = await service.create('user-1', { name: 'Mi portafolio' });

    expect(portfolio.userId).toBe('user-1');
    expect(prisma.portfolio.create).toHaveBeenCalledWith({
      data: { name: 'Mi portafolio', userId: 'user-1' },
    });
  });

  it('lanza NotFoundException si el portafolio no pertenece al usuario', async () => {
    prisma.portfolio.findFirst.mockResolvedValue(null);

    await expect(
      service.findOneOrThrow('user-1', 'otro-portafolio'),
    ).rejects.toThrow(NotFoundException);
  });

  it('retorna el portafolio cuando pertenece al usuario', async () => {
    const portfolio = { id: 'p1', userId: 'user-1', assets: [] };
    prisma.portfolio.findFirst.mockResolvedValue(portfolio);

    const result = await service.findOneOrThrow('user-1', 'p1');

    expect(result).toEqual(portfolio);
  });
});
