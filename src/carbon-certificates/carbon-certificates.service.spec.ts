import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CarbonCertificatesService } from './carbon-certificates.service';
import { CarbonCertificate } from './entities/carbon-certificates.entity';
import { CARBON_STATUS } from './entities/carbon-certificates.enum';

import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/users.entity';

import { DatabaseModule } from '../db/db.module';

describe('CarbonCertificatesService', () => {
  let service: CarbonCertificatesService;
  let userRepository: Repository<User>;
  let carbonCertificatesRepository: Repository<CarbonCertificate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        DatabaseModule,
        TypeOrmModule.forFeature([CarbonCertificate]),
      ],
      providers: [CarbonCertificatesService],
    }).compile();

    service = module.get<CarbonCertificatesService>(CarbonCertificatesService);
    userRepository = module.get(getRepositoryToken(User));
    carbonCertificatesRepository = module.get(
      getRepositoryToken(CarbonCertificate),
    );
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('user repository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('carbon certificates repository should be defined', () => {
    expect(carbonCertificatesRepository).toBeDefined();
  });

  it('should find available certificates', async () => {
    const login = 'owner';

    await userRepository.insert({
      login,
      password: 'owner',
    });

    const owner = await userRepository.findOneBy({ login });

    const availableCertificate = {
      id: 1,
      status: CARBON_STATUS.AVAILABLE,
      country: 'USA',
    };

    const ownedCertificate = {
      id: 2,
      status: CARBON_STATUS.OWNED,
      country: 'Canada',
      owner,
    };

    const transferredCertificate = {
      id: 3,
      status: CARBON_STATUS.TRANSFERRED,
      country: 'France',
      owner,
    };

    await carbonCertificatesRepository.insert([
      availableCertificate,
      ownedCertificate,
      transferredCertificate,
    ]);

    const certificates = await service.getAvailableCarbonCertificates();

    expect(certificates).toEqual([availableCertificate]);
  });

  it('should find owned certificates', async () => {
    const login = 'owner';

    await userRepository.insert({
      login,
      password: 'owner',
    });

    const owner = await userRepository.findOneBy({ login });

    const availableCertificate = {
      id: 1,
      status: CARBON_STATUS.AVAILABLE,
      country: 'USA',
    };

    const ownedCertificate = {
      id: 2,
      status: CARBON_STATUS.OWNED,
      country: 'Canada',
      owner,
    };

    const transferredCertificate = {
      id: 3,
      status: CARBON_STATUS.TRANSFERRED,
      country: 'France',
      owner,
    };

    await carbonCertificatesRepository.insert([
      availableCertificate,
      ownedCertificate,
      transferredCertificate,
    ]);

    const certificates = await service.getOwnedCarbonCertificates(owner.id);

    expect(certificates).toEqual([
      { ...ownedCertificate, owner: { id: owner.id } },
      { ...transferredCertificate, owner: { id: owner.id } },
    ]);
  });

  it('should transfer certificate', async () => {
    const ownerLogin = 'owner',
      recipientLogin = 'recipient',
      certificateId = 1;

    await userRepository.insert([
      {
        login: ownerLogin,
        password: 'owner',
      },
      {
        login: recipientLogin,
        password: 'recipient',
      },
    ]);

    const owner = await userRepository.findOneBy({ login: ownerLogin });
    const recipient = await userRepository.findOneBy({ login: recipientLogin });

    await carbonCertificatesRepository.insert({
      id: certificateId,
      status: CARBON_STATUS.OWNED,
      country: 'USA',
      owner,
    });

    const certificate = await carbonCertificatesRepository.findOneBy({
      id: certificateId,
    });

    const transferredCertificate = await service.transferCarbonCertificate(
      owner.id,
      recipient.id,
      certificate.id,
    );

    expect(transferredCertificate).toEqual({
      ...certificate,
      status: CARBON_STATUS.TRANSFERRED,
      owner: {
        id: recipient.id,
      },
    });
  });
});
