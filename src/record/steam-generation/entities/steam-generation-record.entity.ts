import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
  } from 'typeorm';
  
  @Entity()
  export class SteamGenerationRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ nullable: true })
    createdBy: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;
  
    @Column({ nullable: true })
    plantId: string; // Placeholder for Plant ID
  
    @Column({ nullable: true })
    shiftId: string; // Placeholder for Shift ID
  
    @Column({ type: 'float' })
    initialReading: number;
  
    @Column({ type: 'float' })
    finalReading: number;
  
    @Column({ type: 'float' })
    steamGeneration: number; // Calculated field
  
    @Column({ nullable: true })
    updatedBy: string;
  
    @Column({ nullable: true })
    remarks: string;
  
    @BeforeInsert()
    @BeforeUpdate()
    calculateSteamGeneration() {
      this.steamGeneration = this.finalReading - this.initialReading;
    }
  }
  