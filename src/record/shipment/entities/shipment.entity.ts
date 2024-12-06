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
import { Plant } from 'src/plant/entities/plant.entity';
import { ShiftSchedule } from '../../../shift/shift-schedule/entities/shift-schedule.entity';

@Entity('shipments')
export class Shipment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Plant, { nullable: false })
    @JoinColumn({ name: 'plant_id' })
    plant: Plant;

    // Relation to ShiftSchedule
    @ManyToOne(() => ShiftSchedule, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shift_schedule_id' })
    shiftSchedule: ShiftSchedule;

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

    @Column()
    recordTime: string;

    // Update this field on each update
    @UpdateDateColumn()
    updatedAt: Date;

    // Vehicle number
    @Column()
    vehicleNo: string;

    // Incoming Briquette Weight (in Metric Tons)
    @Column({ type: 'float' })
    incomingBriquetteWeight: number;

    // Incoming stock GCV (Gross Calorific Value in Kcal/kg)
    @Column({ type: 'float' })
    incomingStockGCV: number;

    // Supplier name
    @Column()
    supplier: string;

    // Price per Metric Ton
    @Column({ type: 'float' })
    pricePerMT: number;

    // Additional remarks
    @Column({ nullable: true })
    remarks: string;

    @Column({ type: 'varchar', nullable: true })
    entryPeriod: string;

    @Column({ type: 'varchar', nullable: true })
    entryDate: string;
}
