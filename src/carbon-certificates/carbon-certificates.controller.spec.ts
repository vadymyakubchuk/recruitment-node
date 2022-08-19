import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarbonCertificate } from './entities/carbon-certificates.entity';
import { CarbonCertificatesService } from './carbon-certificates.service';
import { CarbonCertificatesController } from './carbon-certificates.controller';

import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../db/db.module';

describe('CarbonCertificatesController', () => {
  let controller: CarbonCertificatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        DatabaseModule,
        TypeOrmModule.forFeature([CarbonCertificate]),
      ],
      providers: [CarbonCertificatesService],
      controllers: [CarbonCertificatesController],
    }).compile();

    controller = module.get<CarbonCertificatesController>(
      CarbonCertificatesController,
    );
  });

  it('controller should be defined', () => {
    expect(controller).toBeDefined();
  });
});
