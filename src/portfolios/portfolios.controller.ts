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
import { PortfoliosService } from './portfolios.service';
import { ValuationService } from './valuation.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@ApiTags('portfolios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private readonly portfoliosService: PortfoliosService,
    private readonly valuationService: ValuationService,
  ) {}

  @ApiOperation({ summary: 'Crear un portafolio' })
  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePortfolioDto,
  ) {
    return this.portfoliosService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Listar mis portafolios' })
  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.portfoliosService.findAllForUser(user.userId);
  }

  @ApiOperation({ summary: 'Ver un portafolio con sus activos' })
  @Get(':id')
  findOne(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.portfoliosService.findOneOrThrow(user.userId, id);
  }

  @ApiOperation({ summary: 'Ver la valorización y rendimiento del portafolio' })
  @Get(':id/valuation')
  getValuation(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.valuationService.getPortfolioValuation(user.userId, id);
  }

  @ApiOperation({ summary: 'Actualizar un portafolio' })
  @Patch(':id')
  update(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePortfolioDto,
  ) {
    return this.portfoliosService.update(user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Eliminar un portafolio' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    await this.portfoliosService.remove(user.userId, id);
  }
}
