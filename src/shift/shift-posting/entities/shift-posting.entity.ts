import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ShiftSchedule } from '../../shift-schedule/entities/shift-schedule.entity';
  import { User } from '../../../user/entities/user.entity';
  
  @Entity('shift_postings')
  export class ShiftPosting {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // Relation to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, (schedule) => schedule.shiftPostings, { nullable: false })
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;
  
    // Relation to User (staff)
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'staff_id' })
    staff: User;
  
    // Relation to User who created the record
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'created_by' })
    createdBy: User;
  
    // Relation to User who last updated the record
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'updated_by' })
    updatedBy: User;
  
    // Set creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    // Update this field on each update
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }  