import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';
import { SteamGenerationService } from '../../record/steam-generation/steam-generation.service';
import { AshService } from 'src/record/ash/ash.service';
import { ShiftEndEntryDto } from './dtos/shift-end-entry.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { InventoryRecord } from 'src/record/inventory/entities/inventory-record.entity';
import { User } from 'src/user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { InventoryService } from 'src/record/inventory/inventory.service';

@Injectable()
export class ShiftEndService {
    constructor(
        private readonly steamGenService: SteamGenerationService,
        private readonly inventoryService: InventoryService,
        private readonly ashService: AshService,
        @InjectRepository(ShiftSchedule)
        private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Plant)
        private readonly plantRepo: Repository<Plant>,
        @InjectRepository(InventoryRecord)
        private readonly inventoryRepo: Repository<InventoryRecord>,
    ) { }

    async handleShiftEndEntry(data: ShiftEndEntryDto, userId: string) {
        // Fetch user, plant, and shift schedule
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
        if (!plant) {
            throw new NotFoundException('Plant not found');
        }

        const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
        if (!shiftSchedule) {
            throw new NotFoundException('Shift Schedule not found');
        }

        // Create Steam Generation Record
        const steamGenData = {
            shiftId: data.shiftScheduleId,
            plantId: data.plantId,
            initialReading: data.steamGenerationInitialReading,
            finalReading: data.steamGenerationFinalReading,
            remarks: data.remarks,
        };

        await this.steamGenService.create(steamGenData, userId);

        // Get the last record of the inventory
        const lastInventoryRecord = await this.inventoryRepo.findOne({
            where: { plant: { plantId: data.plantId } },
            order: { recordDate: 'DESC', recordTime: 'DESC' },
        });

        // Update Inventory Record
        const inventoryData = {
            shiftScheduleId: data.shiftScheduleId,
            plantId: data.plantId,
            recordDate: format(new Date(), 'yyyy-MM-dd'),
            recordTime: format(new Date(), 'HH:mm:ss'),
            consumption: data.briquetteConsumption,
            addition: 0,
            details: 'Shift End Entry',
            initialValue: lastInventoryRecord ? lastInventoryRecord.finalValue : 0,
        };

        await this.inventoryService.create(inventoryData, userId);

        // Create Ash Generation Record
        const ashData = {
            plantId: data.plantId,
            shiftScheduleId: data.shiftScheduleId,
            ashGenerated: data.ashGenerated,
        };

        await this.ashService.create(ashData, userId);

        return { message: 'Shift end entry processed successfully' };
    }

    async checkIfShiftEndEntryExists(shiftScheduleId: string) {
        const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: shiftScheduleId } });
        if (!shiftSchedule) {
            throw new NotFoundException('Shift Schedule not found');
        }

        // Check if a steam generation record exists for the shift schedule
        const steamGenRecord = await this.steamGenService.findByShiftScheduleId(shiftScheduleId);
        if (steamGenRecord.length > 0) {
            return true;
        }
        return false;
    }

    async getShiftEndEntries(): Promise<any[]> {
        try {
            const queryBuilder = this.shiftScheduleRepo
            .createQueryBuilder('shift_schedules')
            // Join with the Plant table
            .innerJoin(
                'plants', // Table name
                'plant', // Alias
                'plant.plantId = shift_schedules.plant_id' // Join condition
            )
            // Join with the SteamGenerationRecords table
            .innerJoin(
                'steam_generation_records', // Table name
                'steam_generation_records', // Alias
                'steam_generation_records.shift_schedule_id = shift_schedules.id' // Join condition
            )
            // Join with the InventoryRecords table with an additional condition
            .innerJoin(
                'inventory_records', // Table name
                'inventory_records', // Alias
                'inventory_records.shift_schedule_id = shift_schedules.id AND inventory_records.recordType = :recordType', // Join condition
                { recordType: 'Shift_End_Entry' } // Parameters
            )
            // Join with the Ash table
            .innerJoin(
                'ash', // Table name
                'ash', // Alias
                'ash.shift_schedule_id = shift_schedules.id' // Join condition
            )
            // Select specific fields with aliases for easier mapping
            .select([
                'shift_schedules.id AS shiftSchedule_id',
                'shift_schedules.date AS shiftSchedule_date',
                'shift_schedules.shiftTitle AS shiftSchedule_shiftTitle',
                'plant.plantId AS plant_plantId',
                'steam_generation_records.initialReading AS steamGeneration_initialReading',
                'steam_generation_records.finalReading AS steamGeneration_finalReading',
                'steam_generation_records.remarks AS steamGeneration_remarks',
                'inventory_records.consumption AS inventoryRecord_consumption',
                'ash.ashGenerated AS ashGeneration_ashGenerated',
            ]);

        // **Optional Debugging: Log the generated SQL query and parameters**
        console.log('Generated SQL Query:', queryBuilder.getQuery());
        console.log('Query Parameters:', queryBuilder.getParameters());

        // Execute the query and get raw results
        const shiftEndEntriesRaw = await queryBuilder.getRawMany();

        // Map the raw results to the ShiftEndEntry interface
        const shiftEndEntries: any[] = shiftEndEntriesRaw.map((entry) => ({
            shiftScheduleId: entry.shiftSchedule_id,
            plantId: entry.plant_plantId,
            date: format(new Date(entry.shiftSchedule_date), 'yyyy-MM-dd'),
            shiftTitle: entry.shiftSchedule_shiftTitle,
            steamGenerationInitialReading: entry.steamGeneration_initialReading,
            steamGenerationFinalReading: entry.steamGeneration_finalReading,
            remarks: entry.steamGeneration_remarks,
            briquetteConsumption: entry.inventoryRecord_consumption,
            ashGenerated: entry.ashGeneration_ashGenerated,
        }));

        return shiftEndEntries;
    } catch (error) {
        // **Error Handling: Log and re-throw the error**
        console.error('Error in getShiftEndEntries:', error);
        throw error;
    }
}

}
