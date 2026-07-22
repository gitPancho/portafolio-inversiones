import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetsService } from '../assets/assets.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async create(
    userId: string,
    portfolioId: string,
    assetId: string,
    dto: CreateTransactionDto,
  ) {
    await this.assetsService.findOneOrThrow(userId, portfolioId, assetId);
    return this.prisma.transaction.create({
      data: {
        assetId,
        type: dto.type,
        quantity: dto.quantity,
        price: dto.price,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async findAllForAsset(userId: string, portfolioId: string, assetId: string) {
    await this.assetsService.findOneOrThrow(userId, portfolioId, assetId);
    return this.prisma.transaction.findMany({
      where: { assetId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(
    userId: string,
    portfolioId: string,
    assetId: string,
    transactionId: string,
  ) {
    await this.assetsService.findOneOrThrow(userId, portfolioId, assetId);
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, assetId },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    await this.prisma.transaction.delete({ where: { id: transactionId } });
  }
}
