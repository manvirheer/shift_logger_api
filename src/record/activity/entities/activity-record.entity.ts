import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plant } from '../../../plant/entities/plant.entity';
import { User } from '../../../user/entities/user.entity';

@Entity('activity_records')
export class ActivityRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relation to User who created the record
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  // Relation to User who last updated the record
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  // Set creation timestamp
  @CreateDateColumn()
  createdAt: Date;

  // Update this field on each update
  @UpdateDateColumn()
  updatedAt: Date;

  // In activity.entity.ts
  @ManyToOne(() => Plant, { onDelete: 'CASCADE' , nullable: false })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;



  @Column({ nullable: true })
  shiftId: string;

  @Column('text')
  activityDetails: string;
}
