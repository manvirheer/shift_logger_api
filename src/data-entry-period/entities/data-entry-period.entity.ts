// src/data-entry-period/entities/data-entry-period.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { Plant } from '../../plant/entities/plant.entity';
  
  @Entity('data_entry_periods')
  export class DataEntryPeriod {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    periodCode: string;
  
    @Column()
    startTime: string;
  
    @Column()
    endTime: string;
  
    @Column({ nullable: true })
    description: string;
  
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }