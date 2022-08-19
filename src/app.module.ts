import { Module } from '@nestjs/common';

import { DatabaseModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarbonCertificatesModule } from './carbon-certificates/carbon-certificates.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, CarbonCertificatesModule],
})
export class AppModule {}
