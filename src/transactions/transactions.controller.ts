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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios/:portfolioId/assets/:assetId/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Registrar una compra o venta' })
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

  @ApiOperation({ summary: 'Listar transacciones de un activo' })
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

  @ApiOperation({ summary: 'Eliminar una transacción (corrección)' })
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
