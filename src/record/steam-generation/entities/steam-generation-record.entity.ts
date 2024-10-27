import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Plant } from '../../../plant/entities/plant.entity';
import { User } from '../../../user/entities/user.entity';
import { ShiftSchedule } from '../../../shift/shift-schedule/entities/shift-schedule.entity';

@Entity('steam_generation_records')
export class SteamGenerationRecord {
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

  // Relation to Plant
  @ManyToOne(() => Plant, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  // Corrected relation to ShiftSchedule
  @ManyToOne(() => ShiftSchedule, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_schedule_id' })
  shiftSchedule: ShiftSchedule;

  // Readings and calculations
  @Column({ type: 'float' })
  initialReading: number;

  @Column({ type: 'float' })
  finalReading: number;

  @Column({ type: 'float' })
  steamGeneration: number; // Calculated field

  @Column({ nullable: true })
  remarks: string;

  @BeforeInsert()
  @BeforeUpdate()
  calculateSteamGeneration() {
    this.steamGeneration = this.finalReading - this.initialReading;
  }
}
