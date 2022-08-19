import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/users.entity';
import { UsersService } from './users.service';

import { DatabaseModule } from '../db/db.module';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should find user by id', async () => {
    const login = 'user';

    await repository.insert({
      login,
      password: 'user',
    });

    const user = await repository.findOneBy({ login });

    const foundUser = await service.findUserById(user.id);

    expect(foundUser).toEqual(user);
  });

  it('should find user by login', async () => {
    const login = 'user';

    await repository.insert({
      login,
      password: 'user',
    });

    const user = await repository.findOneBy({ login });

    const foundUser = await service.findUserByLogin(login);

    expect(foundUser).toEqual(user);
  });
});
