import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Import entities and DTOs
import { InventoryRecord } from './entities/inventory-record.entity';
import { CreateInventoryDto } from './dtos/create-inventory.dto';
import { UpdateInventoryDto } from './dtos/update-inventory.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryRecord)
    private readonly inventoryRepo: Repository<InventoryRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
  ) {}

  async create(
    data: CreateInventoryDto,
    userId: string
  ): Promise<InventoryRecord> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const record = this.inventoryRepo.create({
      ...data,
      createdBy: user,
      plant: plant,
      updatedBy: null,
    });

    return this.inventoryRepo.save(record);
  }

  async findAll(): Promise<InventoryRecord[]> {
    return this.inventoryRepo.find({
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
  }

  async findOne(id: string): Promise<InventoryRecord> {
    const record = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(
    id: string,
    updateData: UpdateInventoryDto,
    userId: string,
  ): Promise<InventoryRecord> {
    const inventoryRecord = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventoryRecord) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    Object.assign(inventoryRecord, updateData);

    // Update the updatedBy field
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    inventoryRecord.updatedBy = user;

    await this.inventoryRepo.save(inventoryRecord);
    return inventoryRecord;
  }

  async remove(id: string): Promise<void> {
    const result = await this.inventoryRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
  }
}
