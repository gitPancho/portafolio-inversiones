import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfoliosService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreatePortfolioDto) {
    return this.prisma.portfolio.create({
      data: { ...dto, userId },
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(userId: string, portfolioId: string) {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: { assets: true },
    });

    if (!portfolio) {
      throw new NotFoundException('Portafolio no encontrado');
    }

    return portfolio;
  }

  async update(userId: string, portfolioId: string, dto: UpdatePortfolioDto) {
    await this.findOneOrThrow(userId, portfolioId);
    return this.prisma.portfolio.update({
      where: { id: portfolioId },
      data: dto,
    });
  }

  async remove(userId: string, portfolioId: string) {
    await this.findOneOrThrow(userId, portfolioId);
    await this.prisma.portfolio.delete({ where: { id: portfolioId } });
  }
}
