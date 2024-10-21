import { Entity, OneToOne, PrimaryColumn, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('staff')
export class Staff {
  @PrimaryColumn('uuid')
  id: string; 

  @OneToOne(() => User, (user) => user.staff)
  @JoinColumn({ name: 'id' })
  user: User;

  // Staff-specific fields
  @Column()
  a2pEmpId: string;

  @Column()
  fatherName: string;

  @Column()
  areaOfWork: string;

  @Column()
  natureOfWork: string;
}