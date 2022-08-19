import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CarbonCertificate } from './entities/carbon-certificates.entity';
import { CARBON_STATUS } from './entities/carbon-certificates.enum';

import { UsersService } from '../users/users.service';
import { handleError } from '../utils';

@Injectable()
export class CarbonCertificatesService {
  constructor(
    @InjectRepository(CarbonCertificate)
    private carbonCertificatesRepository: Repository<CarbonCertificate>,
    private usersService: UsersService,
  ) {}

  async getAvailableCarbonCertificates(): Promise<CarbonCertificate[]> {
    try {
      return this.carbonCertificatesRepository.findBy({
        status: CARBON_STATUS.AVAILABLE,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getOwnedCarbonCertificates(id: number): Promise<CarbonCertificate[]> {
    try {
      return this.carbonCertificatesRepository.find({
        where: {
          owner: {
            id,
          },
        },
        select: {
          owner: {
            id: true,
          },
        },
        relations: {
          owner: true,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async transferCarbonCertificate(
    ownerId: number,
    recipientId: number,
    certificateId: number,
  ): Promise<CarbonCertificate> {
    try {
      const certificate = await this.carbonCertificatesRepository.findOneBy({
        id: certificateId,
        owner: {
          id: ownerId,
        },
      });

      if (!certificate) throw new NotFoundException('Certificate not found');

      const recipient = await this.usersService.findUserById(recipientId);

      if (!recipient) throw new NotFoundException('User not found');

      await this.carbonCertificatesRepository.update(certificate.id, {
        status: CARBON_STATUS.TRANSFERRED,
        owner: recipient,
      });

      return await this.carbonCertificatesRepository.findOne({
        where: {
          id: certificate.id,
        },
        select: {
          owner: {
            id: true,
          },
        },
        relations: {
          owner: true,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
