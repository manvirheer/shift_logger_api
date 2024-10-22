import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('plants')
export class Plant {
  @PrimaryGeneratedColumn('uuid')
  plantId: string;

  @Column()
  plantName: string;

  @Column()
  plantAddress: string;

  @Column()
  plantContactPerson: string;

  // Set creation timestamp
  @CreateDateColumn()
  createdAt: Date;

  // Update this field on each update
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.plants)
  @JoinTable({
    name: 'user_plants',
    joinColumn: { name: 'plant_id', referencedColumnName: 'plantId' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}