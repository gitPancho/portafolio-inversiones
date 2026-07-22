import { Module } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { ValuationService } from './valuation.service';
import { PortfoliosController } from './portfolios.controller';

@Module({
  controllers: [PortfoliosController],
  providers: [PortfoliosService, ValuationService],
  exports: [PortfoliosService],
})
export class PortfoliosModule {}
