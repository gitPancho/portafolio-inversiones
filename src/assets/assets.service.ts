import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from '../portfolios/portfolios.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfoliosService: PortfoliosService,
  ) {}

  async create(userId: string, portfolioId: string, dto: CreateAssetDto) {
    await this.portfoliosService.findOneOrThrow(userId, portfolioId);

    try {
      return await this.prisma.asset.create({
        data: {
          portfolioId,
          symbol: dto.symbol.toUpperCase(),
          name: dto.name,
          currentPrice: dto.currentPrice ?? 0,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ese activo ya existe en el portafolio');
      }
      throw error;
    }
  }

  async findAllForPortfolio(userId: string, portfolioId: string) {
    await this.portfoliosService.findOneOrThrow(userId, portfolioId);
    return this.prisma.asset.findMany({
      where: { portfolioId },
      orderBy: { symbol: 'asc' },
    });
  }

  async findOneOrThrow(userId: string, portfolioId: string, assetId: string) {
    await this.portfoliosService.findOneOrThrow(userId, portfolioId);
    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, portfolioId },
    });

    if (!asset) {
      throw new NotFoundException('Activo no encontrado');
    }

    return asset;
  }

  async update(
    userId: string,
    portfolioId: string,
    assetId: string,
    dto: UpdateAssetDto,
  ) {
    await this.findOneOrThrow(userId, portfolioId, assetId);
    return this.prisma.asset.update({
      where: { id: assetId },
      data: {
        ...dto,
        symbol: dto.symbol ? dto.symbol.toUpperCase() : undefined,
      },
    });
  }

  async remove(userId: string, portfolioId: string, assetId: string) {
    await this.findOneOrThrow(userId, portfolioId, assetId);
    await this.prisma.asset.delete({ where: { id: assetId } });
  }
}
