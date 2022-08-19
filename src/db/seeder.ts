import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { faker } from '@faker-js/faker';
import { range } from 'lodash';

import { User } from '../users/entities/users.entity';

import { CarbonCertificate } from '../carbon-certificates/entities/carbon-certificates.entity';
import { CARBON_STATUS } from '../carbon-certificates/entities/carbon-certificates.enum';
import { hashPassword } from '../auth/password';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);
    const carbonCertificatesRepository =
      dataSource.getRepository(CarbonCertificate);

    await Promise.all(
      range(0, 10).map(async (i) => {
        const login = faker.internet.userName();

        const password = faker.internet.password();
        const hashedPassword = await hashPassword(password);

        const owner = await userRepository.save({
          login,
          password: hashedPassword,
        });

        const certificateBody =
          i < 5
            ? {
                status: CARBON_STATUS.OWNED,
                owner,
              }
            : {
                status: CARBON_STATUS.AVAILABLE,
              };

        const certificates = range(0, 10).map(() => ({
          country: faker.address.country(),
          ...certificateBody,
        }));

        await carbonCertificatesRepository.save(certificates);
      }),
    );
  }
}
