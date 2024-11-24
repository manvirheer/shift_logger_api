import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ShiftSchedule } from '../../shift-schedule/entities/shift-schedule.entity';
  import { User } from '../../../user/entities/user.entity';
  import { SteamGenerationRecord } from '../../../record/steam-generation/entities/steam-generation-record.entity';
  import { InventoryRecord } from '../../../record/inventory/entities/inventory-record.entity';
  import { Ash } from '../../../record/ash/entities/ash.entity';
  import { Plant } from '../../../plant/entities/plant.entity';
  
  @Entity('shift_end_entries')
  export class ShiftEndEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // Relation to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;
  
    // Relation to User (the user who ended the shift)
    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    // Relation to Plant
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  
    // Relation to SteamGenerationRecord
    @ManyToOne(() => SteamGenerationRecord, { nullable: false })
    @JoinColumn({ name: 'steam_generation_record_id' })
    steamGenerationRecord: SteamGenerationRecord;
  
    // Relation to InventoryRecord
    @ManyToOne(() => InventoryRecord, { nullable: false })
    @JoinColumn({ name: 'inventory_record_id' })
    inventoryRecord: InventoryRecord;
  
    // Relation to Ash
    @ManyToOne(() => Ash, { nullable: false })
    @JoinColumn({ name: 'ash_id' })
    ash: Ash;
  
    @Column({ default: 'None' })
    remarks: string;
  
    // Timestamps
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ type: 'varchar', nullable: true })
    entryPeriod: string;

    @Column({ type: 'varchar', nullable: true })
    entryDate: string;
  }
  