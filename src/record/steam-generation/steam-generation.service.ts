import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { CreateSteamGenerationDto } from './dtos/create-steam-generation.dto';
import { UpdateSteamGenerationDto } from './dtos/update-steam-generation.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';

@Injectable()
export class SteamGenerationService {
  constructor(
    @InjectRepository(SteamGenerationRecord)
    private readonly steamGenRepo: Repository<SteamGenerationRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
  ) { }

  async create(
    data: CreateSteamGenerationDto,
    userId: string
  ): Promise<SteamGenerationRecord> {

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const record = this.steamGenRepo.create({
      ...data,
      createdBy: user,
      plant: plant,
      updatedBy: null,
    });

    return this.steamGenRepo.save(record);
  }

  async findAll(): Promise<SteamGenerationRecord[]> {
    return this.steamGenRepo.find({
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
  }

  async findOne(id: string): Promise<SteamGenerationRecord> {
    const record = await this.steamGenRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(
    id: string,
    updateData: UpdateSteamGenerationDto,
    userId: string,
  ): Promise<SteamGenerationRecord> {
    const steamGenRecord = await this.steamGenRepo.findOne({ where: { id } });
    if (!steamGenRecord) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    Object.assign(steamGenRecord, updateData);

    // Update the updatedBy field
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    steamGenRecord.updatedBy = user;

    await this.steamGenRepo.save(steamGenRecord);
    return steamGenRecord;
  }

  async remove(id: string): Promise<void> {
    const result = await this.steamGenRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
  }
}
