import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios/:portfolioId/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @ApiOperation({ summary: 'Agregar un activo al portafolio' })
  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Body() dto: CreateAssetDto,
  ) {
    return this.assetsService.create(user.userId, portfolioId, dto);
  }

  @ApiOperation({ summary: 'Listar activos del portafolio' })
  @Get()
  findAll(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
  ) {
    return this.assetsService.findAllForPortfolio(user.userId, portfolioId);
  }

  @ApiOperation({ summary: 'Ver un activo' })
  @Get(':assetId')
  findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetsService.findOneOrThrow(user.userId, portfolioId, assetId);
  }

  @ApiOperation({ summary: 'Actualizar un activo (ej. precio actual)' })
  @Patch(':assetId')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(user.userId, portfolioId, assetId, dto);
  }

  @ApiOperation({ summary: 'Quitar un activo del portafolio' })
  @Delete(':assetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('portfolioId') portfolioId: string,
    @Param('assetId') assetId: string,
  ) {
    await this.assetsService.remove(user.userId, portfolioId, assetId);
  }
}
