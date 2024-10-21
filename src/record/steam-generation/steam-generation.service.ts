import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { CreateSteamGenerationDto } from './dtos/create-steam-generation.dto';
import { UpdateSteamGenerationDto } from './dtos/update-steam-generation.dto';

@Injectable()
export class SteamGenerationService {
  constructor(
    @InjectRepository(SteamGenerationRecord)
    private readonly steamGenRepo: Repository<SteamGenerationRecord>,
  ) {}

  async create(
    data: CreateSteamGenerationDto,
  ): Promise<SteamGenerationRecord> {
    const steamGenRecord = this.steamGenRepo.create({
      ...data,
    });

    return this.steamGenRepo.save(steamGenRecord);
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
    const steamGenRecord = await this.steamGenRepo.findOne({ where: { id } });
    if (!steamGenRecord) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    Object.assign(steamGenRecord, updateData);

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