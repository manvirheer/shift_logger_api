import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    TableInheritance,
    BeforeInsert,
  } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { Exclude } from 'class-transformer';
  
  @Entity('users')
  @TableInheritance({ column: { type: 'varchar', name: 'type' } })
  export abstract class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    name: string;
  
    @Column()
    mobile: string;
  
    @Column()
    emergencyContactName: string;
  
    @Column()
    emergencyContactPhoneNumber: string;
  
    @Column()
    @Exclude()
    password: string;
  
    @Column()
    type: string; // Discriminator column
  
    @BeforeInsert()
    async hashPassword() {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  