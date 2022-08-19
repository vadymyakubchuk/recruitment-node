import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';

import { CarbonCertificate } from '../src/carbon-certificates/entities/carbon-certificates.entity';
import { CARBON_STATUS } from '../src/carbon-certificates/entities/carbon-certificates.enum';

import { User } from '../src/users/entities/users.entity';

import { AuthService } from '../src/auth/auth.service';
import { hashPassword } from '../src/auth/password';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: Repository<User>;
  let carbonCertificatesRepository: Repository<CarbonCertificate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    carbonCertificatesRepository = module.get(
      getRepositoryToken(CarbonCertificate),
    );

    await app.init();
  });

  it('auth service should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('user repository should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('carbon certificates repository should be defined', () => {
    expect(carbonCertificatesRepository).toBeDefined();
  });

  it('/auth/login (POST)', async () => {
    const id = 1;
    const login = 'user';
    const password = 'user';

    const hashedPassword = await hashPassword(password);

    await userRepository.insert({
      id,
      login,
      password: hashedPassword,
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: login, password })
      .expect(201);
  });

  it('/auth/login (POST): Unauthorized', async () => {
    const id = 1;
    const login = 'user';
    const password = 'user';

    const hashedPassword = await hashPassword(password);

    await userRepository.insert({
      id,
      login,
      password: hashedPassword,
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: login, password: 'password' })
      .expect(401);
  });

  it('/carbon-certificates/available (GET)', async () => {
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

    const { access_token } = await authService.login(owner);

    return request(app.getHttpServer())
      .get('/carbon-certificates/available')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect([availableCertificate]);
  });

  it('/carbon-certificates/owned (GET)', async () => {
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

    const { access_token } = await authService.login(owner);

    return request(app.getHttpServer())
      .get('/carbon-certificates/owned')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200)
      .expect([
        { ...ownedCertificate, owner: { id: owner.id } },
        { ...transferredCertificate, owner: { id: owner.id } },
      ]);
  });

  it('/carbon-certificates/transfer/:userId (PUT)', async () => {
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

    const { access_token } = await authService.login(owner);

    return request(app.getHttpServer())
      .put(`/carbon-certificates/transfer/${recipient.id}`)
      .set('Authorization', `Bearer ${access_token}`)
      .send({ certificateId: certificate.id })
      .expect(200)
      .expect({
        ...certificate,
        status: CARBON_STATUS.TRANSFERRED,
        owner: {
          id: recipient.id,
        },
      });
  });
});
