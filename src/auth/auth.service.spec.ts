import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    const configValues: Record<string, string> = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        JwtService,
        {
          provide: ConfigService,
          useValue: { getOrThrow: (key: string) => configValues[key] },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('genera tokens al hacer login con credenciales validas', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: hashedPassword,
    });

    const tokens = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('rechaza el login con password incorrecta', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: hashedPassword,
    });

    await expect(
      service.login({ email: 'test@example.com', password: 'incorrecta' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza el login si el usuario no existe', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'no-existe@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
