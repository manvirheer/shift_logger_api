import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToOne,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { Admin } from './admin.entity';
import { Staff } from './staff.entity';
import { Plant } from '../../plant/entities/plant.entity';

// Enum representing user roles
export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff',
}

// Entity representing a user
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

  @Column({ name: 'emergency_contact_name' })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone_number' })
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
    onDelete: 'CASCADE',
  })
  plants: Plant[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
