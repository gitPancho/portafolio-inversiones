import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(UsersService);
  });

  it('crea un usuario con password hasheada', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: '1', ...data }),
    );

    const user = await service.create('test@example.com', 'password123');

    expect(user.email).toBe('test@example.com');
    expect(user.password).not.toBe('password123');
  });

  it('rechaza el registro si el email ya existe', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });

    await expect(
      service.create('test@example.com', 'password123'),
    ).rejects.toThrow(ConflictException);
  });
});
