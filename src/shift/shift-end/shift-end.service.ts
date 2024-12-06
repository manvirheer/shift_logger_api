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
import { UpdateShiftEndEntryDto } from './dtos/update-shift-end-entry.dto';

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

    // Update Inventory Record
    const inventoryData = {
      shiftScheduleId: data.shiftScheduleId,
      plantId: data.plantId,
      recordDate: format(new Date(), 'PP'),
      recordTime: format(new Date(), 'HH:mm:ss'),
      consumption: data.briquetteConsumption,
      addition: 0,
      details: 'Shift End Entry',
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

  async update(data: UpdateShiftEndEntryDto, userId: string) {
    const shiftEndEntry = await this.shiftEndEntryRepo.findOne({
      where: { id: data.id },
      relations: [
        'shiftSchedule',
        'user',
        'plant',
        'steamGenerationRecord',
        'inventoryRecord',
        'ash'
      ],
    });
  
    if (!shiftEndEntry) {
      throw new NotFoundException(`ShiftEndEntry with ID ${data.id} not found`);
    }
  
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  
    let { shiftSchedule, plant } = shiftEndEntry;
  
    // Update shiftSchedule if changed
    if (data.shiftScheduleId && data.shiftScheduleId !== shiftEndEntry.shiftSchedule.id) {
      const newShiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
      if (!newShiftSchedule) throw new NotFoundException('Shift Schedule not found');
      shiftSchedule = newShiftSchedule;
    }
  
    // Update plant if changed
    if (data.plantId && data.plantId !== shiftEndEntry.plant.plantId) {
      const newPlant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
      if (!newPlant) throw new NotFoundException('Plant not found');
      plant = newPlant;
    }
  
    const { entryPeriod, entryDate } = await this.dataEntryPeriodService.findPeriodForTime(
      plant.plantId,
      new Date()
    );
  
    let steamGenRecord = shiftEndEntry.steamGenerationRecord;
    let inventoryRecord = shiftEndEntry.inventoryRecord;
    let ash = shiftEndEntry.ash;
  
    // If steam generation readings or remarks updated, update steamGenerationRecord
    if (
      data.steamGenerationFinalReading !== undefined ||
      data.steamGenerationInitialReading !== undefined ||
      data.remarks !== undefined
    ) {
      const steamGenUpdateData = {
        initialReading: data.steamGenerationInitialReading ?? steamGenRecord.initialReading,
        finalReading: data.steamGenerationFinalReading ?? steamGenRecord.finalReading,
        remarks: data.remarks ?? steamGenRecord.remarks,
      };
      steamGenRecord = await this.steamGenService.update(steamGenRecord.id, steamGenUpdateData, userId);
    }
  
    // If briquetteConsumption changed, update inventoryRecord
    if (data.briquetteConsumption !== undefined) {
      const invUpdateData = {
        consumption: data.briquetteConsumption,
        // Keep other fields as they are if not changed
        addition: inventoryRecord.addition,
        details: inventoryRecord.details,
      };
      inventoryRecord = await this.inventoryService.update(inventoryRecord.id, invUpdateData, userId);
    }
  
    // If ashGenerated changed, update ash record
    if (data.ashGenerated !== undefined) {
      const ashUpdateData = {
        ashGenerated: data.ashGenerated,
      };
      ash = await this.ashService.update(ash.id, ashUpdateData, userId);
    }
  
    const remarks = data.remarks ?? shiftEndEntry.remarks;
  
    // Update the main shiftEndEntry record
    shiftEndEntry.shiftSchedule = shiftSchedule;
    shiftEndEntry.user = user;
    shiftEndEntry.plant = plant;
    shiftEndEntry.steamGenerationRecord = steamGenRecord;
    shiftEndEntry.inventoryRecord = inventoryRecord;
    shiftEndEntry.ash = ash;
    shiftEndEntry.remarks = remarks;
    shiftEndEntry.entryDate = entryDate;
    shiftEndEntry.entryPeriod = entryPeriod;
  
    await this.shiftEndEntryRepo.save(shiftEndEntry);
  
    return { message: 'Shift end entry updated successfully', shiftEndEntry };
  }
  
}
