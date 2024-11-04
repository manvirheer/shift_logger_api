import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../../../user/entities/user.entity';
  import { Plant } from '../../../plant/entities/plant.entity';
  import { ShiftSchedule } from '../../../shift/shift-schedule/entities/shift-schedule.entity';
  
  @Entity('ash')
  export class Ash {
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
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relation to Plant
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;
  
    // Relation to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, { nullable: false })
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;
  
    // Amount of ash generated
    @Column({ type: 'float' })
    ashGenerated: number;
  }
  