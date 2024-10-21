import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';
  
  @Entity()
  export class ActivityRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ nullable: true })
    createdBy: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;
  
    @Column({ nullable: true })
    updatedBy: string;
  
    @Column({ nullable: true })
    shiftId: string; // TODO: Replace with Shift entity when ready
  
    @Column({ nullable: true })
    plantId: string; // TODO: Replace with Plant entity when ready
  
    @Column('text')
    activityDetails: string;
  }
  