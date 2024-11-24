import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryRecord } from './entities/inventory-record.entity';
import { CreateInventoryRecordDto } from './dtos/create-inventory.dto';
import { UpdateInventoryRecordDto } from './dtos/update-inventory.dto';
import { User } from 'src/user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

interface InventoryQueryParams {
  plantId?: string;
  shiftScheduleId?: string;
  // Add other query parameters as needed
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryRecord)
    private readonly inventoryRepo: Repository<InventoryRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    private readonly dataEntryPeriodService: DataEntryPeriodService,
  ) { }

  async create(data: CreateInventoryRecordDto, userId: string): Promise<InventoryRecord> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) throw new NotFoundException('Plant not found');

    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
    if (!shiftSchedule) throw new NotFoundException('Shift Schedule not found');

    const inventory = this.inventoryRepo.create({
      ...data,
      createdBy: user,
      plant,
      shiftSchedule,
      updatedBy: null,
    });

    const { entryPeriod, entryDate } = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());
    inventory.entryPeriod = entryPeriod;
    inventory.entryDate = entryDate;

    return this.inventoryRepo.save(inventory);
  }

  async findAll(params: InventoryQueryParams): Promise<InventoryRecord[]> {
    const whereConditions: any = {};

    if (params.plantId) {
      whereConditions.plant = { plantId: params.plantId };
    }

    if (params.shiftScheduleId) {
      whereConditions.shiftSchedule = { id: params.shiftScheduleId };
    }

    return this.inventoryRepo.find({
      where: whereConditions,
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<InventoryRecord> {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!inventory) throw new NotFoundException(`Inventory record with ID ${id} not found`);
    return inventory;
  }

  async update(id: string, updateData: UpdateInventoryRecordDto, userId: string): Promise<InventoryRecord> {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!inventory) throw new NotFoundException(`Inventory record with ID ${id} not found`);

    if (updateData.plantId) {
      const plant = await this.plantRepo.findOne({ where: { plantId: updateData.plantId } });
      if (!plant) throw new NotFoundException('Plant not found');
      inventory.plant = plant;
    }

    if (updateData.shiftScheduleId) {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: updateData.shiftScheduleId } });
      if (!shiftSchedule) throw new NotFoundException('Shift Schedule not found');
      inventory.shiftSchedule = shiftSchedule;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    inventory.updatedBy = user;

    const { entryPeriod, entryDate } = await this.dataEntryPeriodService.findPeriodForTime(inventory.plant.plantId, new Date());
    inventory.entryPeriod = entryPeriod;
    inventory.entryDate = entryDate;

    Object.assign(inventory, updateData);
    return this.inventoryRepo.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inventoryRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Inventory record with ID ${id} not found`);
  }
}
