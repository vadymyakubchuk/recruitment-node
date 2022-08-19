import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/users.entity';

import { handleError } from '../utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User> {
    try {
      return this.usersRepository.findOneBy({ id });
    } catch (error) {
      handleError(error);
    }
  }

  async findUserByLogin(login: string): Promise<User> {
    try {
      return this.usersRepository.findOneBy({ login });
    } catch (error) {
      handleError(error);
    }
  }
}
