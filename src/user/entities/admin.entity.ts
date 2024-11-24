import { Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

// Entity representing an admin user
@Entity('admins')
export class Admin {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.admin)
  @JoinColumn({ name: 'id' })
  user: User;
}
