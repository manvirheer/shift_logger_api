import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';

@Entity('inventory_records')
export class InventoryRecord {
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

    // Set creation timestamp
    @CreateDateColumn()
    createdAt: Date;

    // Update this field on each update
    @UpdateDateColumn()
    updatedAt: Date;

    // Relation to Plant
    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;

    // Shift ID
    @Column({ nullable: true })
    shiftId: string;

    // Shift Reading
    @Column({ type: 'float' })
    shiftReading: number;

    // Additional details
    @Column({ nullable: true })
    details: string;
}
