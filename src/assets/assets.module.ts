import { Module } from '@nestjs/common';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';

@Module({
  imports: [PortfoliosModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
