import { Entity, OneToOne, PrimaryColumn, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('admins')
export class Admin {
  @PrimaryColumn('uuid')
  id: string; 

  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn({ name: 'id' })
  user: User;

//   @Column({ nullable: true })
//   adminSpecificField?: string;
}