import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.BUY })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 200 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: '2026-07-21T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
