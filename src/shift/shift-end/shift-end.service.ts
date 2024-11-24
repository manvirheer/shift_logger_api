import { Injectable, NotFoundException } from '@nestjs/common';
import { format } from 'date-fns';
import { SteamGenerationService } from '../../record/steam-generation/steam-generation.service';
import { AshService } from 'src/record/ash/ash.service';
import { ShiftEndEntryDto } from './dtos/shift-end-entry.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftSchedule } from '../shift-schedule/entities/shift-schedule.entity';
import { InventoryRecord } from 'src/record/inventory/entities/inventory-record.entity';
import { User } from 'src/user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { InventoryService } from 'src/record/inventory/inventory.service';
import { ShiftEndEntry } from './entities/shift-end-entry.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

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
    @InjectRepository(ShiftEndEntry)
    private readonly shiftEndEntryRepo: Repository<ShiftEndEntry>,
    private readonly dataEntryPeriodService: DataEntryPeriodService,
  ) { }

  async handleShiftEndEntry(data: ShiftEndEntryDto, userId: string) {
    // Fetch user, plant, and shift schedule
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({
      where: { plantId: data.plantId },
    });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const shiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { id: data.shiftScheduleId },
    });
    if (!shiftSchedule) {
      throw new NotFoundException('Shift Schedule not found');
    }

    // Create Steam Generation Record
    const steamGenData = {
      shiftId: data.shiftScheduleId,
      plantId: data.plantId,
      initialReading: data.steamGenerationInitialReading,
      finalReading: data.steamGenerationFinalReading,
      remarks: data.remarks || 'None',
    };

    const { entryPeriod, entryDate } = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());

    const steamGenerationRecord =
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

    const inventoryRecord = await this.inventoryService.create(
      inventoryData,
      userId,
    );

    // Create Ash Generation Record
    const ashData = {
      plantId: data.plantId,
      shiftScheduleId: data.shiftScheduleId,
      ashGenerated: data.ashGenerated,
    };

    const ash = await this.ashService.create(ashData, userId);

    // Create ShiftEndEntry
    const shiftEndEntry = this.shiftEndEntryRepo.create({
      shiftSchedule,
      user,
      plant,
      steamGenerationRecord,
      inventoryRecord,
      entryDate,
      entryPeriod,
      ash,
      remarks: data.remarks || 'None',
    });

    await this.shiftEndEntryRepo.save(shiftEndEntry);

    return { message: 'Shift end entry processed successfully', shiftEndEntry };
  }

  async checkIfShiftEndEntryExists(shiftScheduleId: string) {
    const shiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { id: shiftScheduleId },
    });
    if (!shiftSchedule) {
      throw new NotFoundException('Shift Schedule not found');
    }

    // Check if a shift end entry exists for the shift schedule
    const exists = await this.shiftEndEntryRepo.findOne({
      where: { shiftSchedule: { id: shiftScheduleId } },
    });

    return !!exists;
  }

  async getShiftEndEntries(): Promise<ShiftEndEntry[]> {
    try {
      return await this.shiftEndEntryRepo.find({
        relations: [
          'shiftSchedule',
          'user',
          'plant',
          'steamGenerationRecord',
          'inventoryRecord',
          'ash',
        ],
      });
    } catch (error) {
      console.error('Error in getShiftEndEntries:', error);
      throw error;
    }
  }
}
