import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAssetDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  @MinLength(1)
  symbol: string;

  @ApiPropertyOptional({ example: 'Apple Inc.' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 230.5, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentPrice?: number;
}
