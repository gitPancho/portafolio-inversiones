import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('portfolios/:portfolioId/assets/:assetId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(
      user.userId,
      portfolioId,
      assetId,
      dto,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.transactionsService.findAllForAsset(
      user.userId,
      portfolioId,
      assetId,
    );
  }

  @Delete(':transactionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
    @Param('transactionId') transactionId: string,
  ) {
    await this.transactionsService.remove(
      user.userId,
      portfolioId,
      assetId,
      transactionId,
    );
  }
}
