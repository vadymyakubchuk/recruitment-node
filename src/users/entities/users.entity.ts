import {
  Entity,
  Unique,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CarbonCertificate } from '../../carbon-certificates/entities/carbon-certificates.entity';

@Entity()
@Unique(['login'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  login: string;

  @Column()
  password: string;

  @OneToMany(
    () => CarbonCertificate,
    (carbonCertificate) => carbonCertificate.owner,
  )
  carbonCertificates: CarbonCertificate[];
}
