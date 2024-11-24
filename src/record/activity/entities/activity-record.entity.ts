// src/activity/entities/activity-record.entity.ts
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
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';
import { Inject, Injectable } from '@nestjs/common';

@Entity('activity_records')
export class ActivityRecord {
  @PrimaryGeneratedColumn('uuid')
  activityId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Plant, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'plant_id' })
  plant: Plant;

  @ManyToOne(() => ShiftSchedule, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_schedule_id' })
  shiftSchedule: ShiftSchedule;

  @Column('text')
  activityDetails: string;

  @Column({ type: 'varchar', nullable: true })
  entryPeriod: string;

  @Column({ type: 'varchar', nullable: true })
  entryDate: string;

}
