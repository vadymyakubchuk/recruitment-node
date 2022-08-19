import {
  Controller,
  Get,
  Put,
  UseGuards,
  Request,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { CarbonCertificatesService } from './carbon-certificates.service';
import { CarbonCertificate } from './entities/carbon-certificates.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('carbon-certificates')
export class CarbonCertificatesController {
  constructor(private carbonCertificatesService: CarbonCertificatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('available')
  async getAvailableCarbonCertificates(): Promise<CarbonCertificate[]> {
    return this.carbonCertificatesService.getAvailableCarbonCertificates();
  }

  @UseGuards(JwtAuthGuard)
  @Get('owned')
  async getOwnedCarbonCertificates(
    @Request() req,
  ): Promise<CarbonCertificate[]> {
    return this.carbonCertificatesService.getOwnedCarbonCertificates(
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('transfer/:userId')
  async transferCarbonCertificate(
    @Request() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('certificateId', ParseIntPipe) certificateId: number,
  ): Promise<CarbonCertificate> {
    return this.carbonCertificatesService.transferCarbonCertificate(
      req.user.id,
      userId,
      certificateId,
    );
  }
}
