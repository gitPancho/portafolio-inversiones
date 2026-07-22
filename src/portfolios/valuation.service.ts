import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PortfoliosService } from './portfolios.service';

export interface AssetValuation {
  assetId: string;
  symbol: string;
  name: string | null;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  costBasis: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

@Injectable()
export class ValuationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portfoliosService: PortfoliosService,
  ) {}

  async getPortfolioValuation(userId: string, portfolioId: string) {
    await this.portfoliosService.findOneOrThrow(userId, portfolioId);

    const assets = await this.prisma.asset.findMany({
      where: { portfolioId },
      include: { transactions: true },
    });

    const assetValuations = assets.map((asset) => this.valuateAsset(asset));

    const totalCostBasis = assetValuations.reduce(
      (sum, a) => sum + a.costBasis,
      0,
    );
    const totalMarketValue = assetValuations.reduce(
      (sum, a) => sum + a.marketValue,
      0,
    );
    const totalGainLoss = totalMarketValue - totalCostBasis;
    const totalGainLossPercent =
      totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

    return {
      portfolioId,
      totalCostBasis: round(totalCostBasis),
      totalMarketValue: round(totalMarketValue),
      totalGainLoss: round(totalGainLoss),
      totalGainLossPercent: round(totalGainLossPercent),
      assets: assetValuations,
    };
  }

  private valuateAsset(asset: {
    id: string;
    symbol: string;
    name: string | null;
    currentPrice: unknown;
    transactions: {
      type: TransactionType;
      quantity: unknown;
      price: unknown;
    }[];
  }): AssetValuation {
    let boughtQuantity = 0;
    let boughtCost = 0;
    let soldQuantity = 0;

    for (const tx of asset.transactions) {
      const quantity = Number(tx.quantity);
      const price = Number(tx.price);

      if (tx.type === TransactionType.BUY) {
        boughtQuantity += quantity;
        boughtCost += quantity * price;
      } else {
        soldQuantity += quantity;
      }
    }

    const averageCost = boughtQuantity > 0 ? boughtCost / boughtQuantity : 0;
    const quantity = boughtQuantity - soldQuantity;
    const currentPrice = Number(asset.currentPrice);
    const costBasis = quantity * averageCost;
    const marketValue = quantity * currentPrice;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity: round(quantity),
      averageCost: round(averageCost),
      currentPrice: round(currentPrice),
      costBasis: round(costBasis),
      marketValue: round(marketValue),
      gainLoss: round(gainLoss),
      gainLossPercent: round(gainLossPercent),
    };
  }
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
