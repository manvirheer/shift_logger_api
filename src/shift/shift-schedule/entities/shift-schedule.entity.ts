import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { ShiftPosting } from '../../shift-posting/entities/shift-posting.entity';
  import { Plant } from '../../../plant/entities/plant.entity';
  import { User } from '../../../user/entities/user.entity';
  
  export enum ShiftTitle {
    A = 'A',
    B = 'B',
    C = 'C',
  }
  
  @Entity('shift_schedules')
  export class ShiftSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({
      type: 'enum',
      enum: ShiftTitle,
    })
    shiftTitle: ShiftTitle;
  
    @Column({ type: 'date' })
    date: string; // The date of the shift
  
    @Column({ type: 'time' })
    startTime: string; // e.g., '06:00:00'
  
    @Column({ type: 'time' })
    endTime: string; // e.g., '14:00:00'
  
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
    updatedBy: User;
  
    // Set creation timestamp
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    // Update this field on each update
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Relation to ShiftPostings
    @OneToMany(() => ShiftPosting, (posting) => posting.shiftSchedule)
    shiftPostings: ShiftPosting[];
  }
  