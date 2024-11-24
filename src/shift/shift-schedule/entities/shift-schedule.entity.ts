import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ShiftTemplate } from '../../shift-template/entities/shift-template.entity';
import { Plant } from '../../../plant/entities/plant.entity';
import { User } from '../../../user/entities/user.entity';
import { ShiftAssignment } from '../../shift-assignment/entities/shift-assignment.entity';

export enum ShiftStatus {
  PLANNED = 'Planned',
  ATTENDED = 'Attended',
  CHANGED = 'Changed',
}

@Entity('shift_schedules')
export class ShiftSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shiftTitle: string; // Customizable title, can inherit from ShiftTemplate.name

  @Column({ type: 'timestamp' })
  @Index()
  startTime: Date; // Start datetime of the shift

  @Column({ type: 'timestamp' })
  endTime: Date; // End datetime of the shift

  // Relation to ShiftTemplate (nullable for custom shifts)
  @ManyToOne(() => ShiftTemplate, (template) => template.shiftSchedules, {
    nullable: true,
  })
  @JoinColumn({ name: 'shift_template_id' })
  shiftTemplate?: ShiftTemplate;

  // Relation to Plant
  @ManyToOne(() => Plant, { nullable: false })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  // Relation to User who created the record
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  // Relation to User who last updated the record
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  // Optional date field for template-based shifts
  @Column({ type: 'date', nullable: true })
  date?: string;

  // Shift Status
  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.PLANNED,
  })
  status: ShiftStatus;

  // Optional description for status changes
  @Column({ type: 'text', nullable: true })
  statusDescription?: string;

  // Shift Duration in hours
  @Column({ type: 'float', nullable: false })
  shiftDuration: number;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relation to ShiftAssignments
  @OneToMany(() => ShiftAssignment, (assignment) => assignment.shiftSchedule)
  shiftAssignments: ShiftAssignment[];

  @BeforeInsert()
  @BeforeUpdate()
  calculateShiftDuration() {
    const durationInMilliseconds = this.endTime.getTime() - this.startTime.getTime();
    this.shiftDuration = Math.abs(durationInMilliseconds) / (1000 * 60 * 60); // Convert to hours
  }
}
