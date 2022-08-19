import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';

import { User } from '../users/entities/users.entity';
import { CarbonCertificate } from '../carbon-certificates/entities/carbon-certificates.entity';

import Seeder from './seeder';

export const DatabaseModule = TypeOrmModule.forRootAsync({
  useFactory: () => {
    const seeds = process.env.NODE_ENV === 'test' ? [] : [Seeder];

    const options: DataSourceOptions & SeederOptions = {
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [User, CarbonCertificate],
      seeds,
    };

    return options;
  },
  dataSourceFactory: async (options) => {
    const dataSource = new DataSource(options);

    await dataSource.initialize();

    await runSeeders(dataSource);

    return dataSource;
  },
});
