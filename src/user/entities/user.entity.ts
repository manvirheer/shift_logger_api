import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Admin } from './admin.entity';
import { Staff } from './staff.entity';
import { Plant } from '../../plant/entities/plant.entity';

export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  mobile: string;

  @Column()
  emergencyContactName: string;

  @Column()
  emergencyContactPhoneNumber: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @OneToOne(() => Admin, (admin) => admin.user, { cascade: true, eager: true })
  admin?: Admin;

  @OneToOne(() => Staff, (staff) => staff.user, { cascade: true, eager: true })
  staff?: Staff;

  @ManyToMany(() => Plant, (plant) => plant.users, {
    onDelete: 'CASCADE', // Adding CASCADE to ensure dependent join records are deleted
  })
  plants: Plant[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
