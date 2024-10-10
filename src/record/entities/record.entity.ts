import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    TableInheritance,
  } from 'typeorm';
  
  @Entity()
  @TableInheritance({ column: { type: 'varchar', name: 'type' } })
  export abstract class Record {
    @PrimaryGeneratedColumn('uuid')
    id: string; 
    
    // Discriminator column
    @Column()
    type: string;
  
    @CreateDateColumn()
    timestamp: Date;
  
    @Column({ nullable: true })
    createdBy: string;
  }