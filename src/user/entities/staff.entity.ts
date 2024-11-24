import { Entity, OneToOne, PrimaryColumn, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

// Entity representing a staff user
@Entity('staff')
export class Staff {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: User;

  @Column({ name: 'a2p_emp_id' })
  a2pEmpId: string;

  @Column({ name: 'father_name' })
  fatherName: string;

  @Column({ name: 'area_of_work' })
  areaOfWork: string;

  @Column({ name: 'nature_of_work' })
  natureOfWork: string;
}
