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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.plants, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'user_plants',
    joinColumn: { name: 'plant_id', referencedColumnName: 'plantId' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];
}
