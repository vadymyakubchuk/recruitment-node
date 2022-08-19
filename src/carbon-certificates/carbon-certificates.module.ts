import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarbonCertificate } from './entities/carbon-certificates.entity';
import { CarbonCertificatesService } from './carbon-certificates.service';
import { CarbonCertificatesController } from './carbon-certificates.controller';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonCertificate]), UsersModule],
  providers: [CarbonCertificatesService],
  controllers: [CarbonCertificatesController],
})
export class CarbonCertificatesModule {}
