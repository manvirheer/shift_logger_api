import { ChildEntity, Column } from 'typeorm';
import { Record } from '../../entities/record.entity';

@ChildEntity()
export class SteamGenerationRecord extends Record {
  @Column({ type: 'enum', enum: ['A', 'B', 'C'] })
  shift: 'A' | 'B' | 'C';

  @Column({ type: 'float' })
  initialReading: number;

  @Column({ type: 'float' })
  finalReading: number;

  @Column({ type: 'float' })
  steamGeneration: number; // In kgs

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  remarks: string;
}