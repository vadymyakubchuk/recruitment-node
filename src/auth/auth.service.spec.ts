import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { AuthService } from './auth.service';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { User } from '../users/entities/users.entity';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../db/db.module';
import { hashPassword } from './password';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;

  const secret = 'test-secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        UsersModule,
        PassportModule,
        JwtModule.register({
          secret,
          signOptions: { expiresIn: '600s' },
        }),
        DatabaseModule,
        TypeOrmModule.forFeature([User]),
      ],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(getRepositoryToken(User));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should generate right token', async () => {
    const id = 1;
    const login = 'user';

    await repository.insert({
      id,
      login,
      password: 'user',
    });

    const user = await repository.findOneBy({ id });

    const { access_token } = await service.login(user);

    const decodedToken = jwt.verify(access_token, secret);

    const userId = typeof decodedToken === 'object' ? decodedToken.id : '';
    const userLogin =
      typeof decodedToken === 'object' ? decodedToken.login : '';

    expect({ id: userId, login: userLogin }).toEqual({
      id,
      login,
    });
  });

  it('should validate user', async () => {
    const id = 1;
    const login = 'user';
    const password = 'password';

    const hashedPassword = await hashPassword(password);

    await repository.insert({
      id,
      login,
      password: hashedPassword,
    });

    const user = await repository.findOneBy({ id });

    const validatedUser = await service.validateUser(login, password);

    expect({ id: validatedUser.id, login: validatedUser.login }).toEqual({
      id: user.id,
      login: user.login,
    });
  });
});
