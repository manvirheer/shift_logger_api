import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamGenerationRecord } from './entities/steam_generation_record.entity';
import { CreateSteamGenerationDto } from './dtos/create_steam_generation.dto';
import { UpdateSteamGenerationDto } from './dtos/update_steam_generation.dto';

@Injectable()
export class SteamGenerationRecordService {
  constructor(
    @InjectRepository(SteamGenerationRecord)
    private readonly steamGenRepo: Repository<SteamGenerationRecord>,
  ) {}

  async create(data: CreateSteamGenerationDto): Promise<SteamGenerationRecord> {
    const record = this.steamGenRepo.create({
      ...data,
      type: 'SteamGenerationRecord', // Discriminator column value
    });
    return this.steamGenRepo.save(record);
  }

  async findAll(): Promise<SteamGenerationRecord[]> {
    return this.steamGenRepo.find();
  }

  async findOne(id: string): Promise<SteamGenerationRecord> {
    const record = await this.steamGenRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async update(
    id: string,
    updateData: UpdateSteamGenerationDto,
  ): Promise<SteamGenerationRecord> {
    await this.steamGenRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.steamGenRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
  }
}