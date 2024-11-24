import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShiftSchedule } from '../../shift-schedule/entities/shift-schedule.entity';
import { User } from '../../../user/entities/user.entity';

export enum ValidationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('shift_assignments')
export class ShiftAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relation to ShiftSchedule
  @ManyToOne(() => ShiftSchedule, (schedule) => schedule.shiftAssignments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shift_schedule_id' })
  shiftSchedule: ShiftSchedule;

  // Relation to User (staff member assigned to the shift)
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relation to User who assigned the shift
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'assigned_by' })
  assignedBy: User;

  // Indicates if validation is required
  @Column({ default: false })
  requiresValidation: boolean;

  // Validation status
  @Column({
    type: 'enum',
    enum: ValidationStatus,
    default: ValidationStatus.APPROVED,
  })
  validationStatus: ValidationStatus;

  // Relation to User who validated the assignment
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'validated_by' })
  validatedBy?: User;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
