// src/record/inventory-record/entities/inventory-record.entity.ts

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
    OneToOne,
  } from 'typeorm';
  import { User } from 'src/user/entities/user.entity';
  import { Plant } from 'src/plant/entities/plant.entity';
  import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
  import { Shipment } from '../../shipment/entities/shipment.entity'; // Import Shipment
  
  @Entity('inventory_records')
  export class InventoryRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // Relation to Shipment
    @OneToOne(() => Shipment, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shipment_id' })
    shipment: Shipment;
  
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
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  
    // Reference to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;
  
    @Column()
    recordTime: string;

    @Column()
    recordType: string = 'Shift_End_Entry';

    @Column({ type: 'varchar', nullable: true })
    entryPeriod: string;
  
    // Shift Start Reading
    @Column({ type: 'float' })
    initialValue: number;
  
    // Consumption
    @Column({ type: 'float', nullable: true })
    consumption: number;
  
    // Addition
    @Column({ type: 'float', nullable: true })
    addition: number;
  
    // Final Value based on initialValue - consumption + addition
    @Column({ type: 'float', nullable: true })
    finalValue: number = 0;
  
    // Additional details
    @Column({ nullable: true })
    details: string;

    @Column({ type: 'varchar', nullable: true })
    entryDate: string;
  
    @BeforeInsert()
    @BeforeUpdate()
    updateFinalValue() {
      this.finalValue = this.initialValue - (this.consumption ?? 0) + (this.addition ?? 0);
    }


  }
  