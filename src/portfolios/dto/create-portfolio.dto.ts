import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'Mi primer portafolio' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Cuenta de largo plazo' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
