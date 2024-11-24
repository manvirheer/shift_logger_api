// src/shift/shift-template/entities/shift-template.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
  } from 'typeorm';
  import { ShiftSchedule } from '../../shift-schedule/entities/shift-schedule.entity';
  import { Plant } from '../../../plant/entities/plant.entity';
  
  export enum ShiftType {
    STANDARD = 'Standard',
    LONG = 'Long',
  }
  
  @Entity('shift_templates')
  export class ShiftTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string; // e.g., "Standard Shift", "Long Shift", "Shift A", "Shift B", etc.
  
    @Column({ type: 'time' })
    defaultStartTime: string; // Format 'HH:mm:ss', e.g., '06:00:00'
  
    @Column({ type: 'time' })
    defaultEndTime: string; // Format 'HH:mm:ss', e.g., '14:00:00'
  
    @Column({
      type: 'enum',
      enum: ShiftType,
    })
    shiftType: ShiftType;
  
    @Column({ nullable: true })
    description?: string;
  
    // Timestamps
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @OneToMany(() => ShiftSchedule, (schedule) => schedule.shiftTemplate)
    shiftSchedules: ShiftSchedule[];
  
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  }
  