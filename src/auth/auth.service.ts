import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserGuardPayload } from './auth';
import { validatePassword } from './password';

import { User } from '../users/entities/users.entity';
import { UsersService } from '../users/users.service';

import { handleError } from '../utils';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: User) {
    try {
      const payload = { id: user.id, login: user.login };

      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserGuardPayload> {
    try {
      const user = await this.usersService.findUserByLogin(login);

      if (user) {
        const isValidUser = await validatePassword(password, user.password);

        if (isValidUser) {
          const { id } = user;

          return {
            id,
            login,
          };
        }
      }

      return null;
    } catch (error) {
      handleError(error);
    }
  }
}
