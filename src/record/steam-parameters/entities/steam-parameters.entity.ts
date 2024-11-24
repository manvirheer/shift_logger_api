import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    In,
    Index,
  } from 'typeorm';
  import { User } from '../../../user/entities/user.entity';
  import { Plant } from '../../../plant/entities/plant.entity';
  import { ShiftSchedule } from '../../../shift/shift-schedule/entities/shift-schedule.entity';
  
  @Entity('steam_parameters')
  export class SteamParameters {
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
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  
    // Relation to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, { nullable: false})
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;

    @Column({ type: 'varchar', nullable: true })
    entryPeriod: string;

    @Column({ type: 'varchar', nullable: true })
    entryDate: string;
  
    // Optional fields
    @Column({ name: 'time_start', type: 'varchar', nullable: true })
    @Index()
    timeStart?: string;
  
    @Column({ name: 'time_end', type: 'varchar', nullable: true })
    timeEnd?: string;
  
    @Column({ name: 'steam_pressure', type: 'float', nullable: true })
    steamPressure?: number;
  
    @Column({ name: 'steam_flow', type: 'float', nullable: true })
    steamFlow?: number;
  
    @Column({ name: 'steam_temperature', type: 'float', nullable: true })
    steamTemperature?: number;
  
    @Column({ name: 'el_meter', type: 'float', nullable: true })
    elMeter?: number;
  
    @Column({ name: 'stack_temperature', type: 'float', nullable: true })
    stackTemperature?: number;
  
    @Column({ name: 'feed_water_temperature', type: 'float', nullable: true })
    feedWaterTemperature?: number;
  
    @Column({ name: 'feed_water_meter_reading', type: 'float', nullable: true })
    feedWaterMeterReading?: number;
  
    @Column({ name: 'fuel_pump_pr', type: 'float', nullable: true })
    fuelPumpPr?: number;
  
    @Column({ name: 'fuel_pump_rt_pr', type: 'float', nullable: true })
    fuelPumpRtPr?: number;
  
    @Column({ name: 'filter_number', type: 'float', nullable: true })
    filterNumber?: number;
  
    @Column({ name: 'feed_water_pr', type: 'float', nullable: true })
    feedWaterPr?: number;
  
    @Column({ name: 'feed_water_ph', type: 'float', nullable: true })
    feedWaterPh?: number;
  
    @Column({ name: 'feed_water_tds', type: 'float', nullable: true })
    feedWaterTds?: number;
  
    @Column({ name: 'blow_down_ph', type: 'float', nullable: true })
    blowDownPh?: number;
  
    @Column({ name: 'blow_down_tds', type: 'float', nullable: true })
    blowDownTds?: number;
  }
  