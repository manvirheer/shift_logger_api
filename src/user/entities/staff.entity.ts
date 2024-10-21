import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';

@ChildEntity('staff')
export class Staff extends User {
  @Column()
  a2pEmpId: string;

  @Column()
  fatherName: string;

  @Column()
  areaOfWork: string;

  @Column()
  natureOfWork: string;

}
