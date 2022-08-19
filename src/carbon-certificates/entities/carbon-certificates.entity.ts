import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { CARBON_STATUS } from './carbon-certificates.enum';

import { User } from '../../users/entities/users.entity';

@Entity()
export class CarbonCertificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country: string;

  @Column()
  status: CARBON_STATUS;

  @ManyToOne(() => User, (user) => user.carbonCertificates)
  owner: User;
}
