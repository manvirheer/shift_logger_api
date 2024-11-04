import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { CreateSteamGenerationDto } from './dtos/create-steam-generation.dto';
import { UpdateSteamGenerationDto } from './dtos/update-steam-generation.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';

@Injectable()
export class SteamGenerationService {
  constructor(
    @InjectRepository(SteamGenerationRecord)
    private readonly steamGenRepo: Repository<SteamGenerationRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>, // Inject ShiftSchedule repository
  ) { }

  async create(
    data: CreateSteamGenerationDto,
    userId: string
  ): Promise<SteamGenerationRecord> {

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } }); // Assuming 'id' is the primary key
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftId } });
    if (!shiftSchedule) {
      throw new NotFoundException('Shift Schedule not found');
    }

    const record = this.steamGenRepo.create({
      initialReading: data.initialReading,
      finalReading: data.finalReading,
      remarks: data.remarks,
      createdBy: user,
      plant: plant,
      shiftSchedule: shiftSchedule,
      updatedBy: null,
    });

    return this.steamGenRepo.save(record);
  }

  async deleteAll(): Promise<void> {
    await this.steamGenRepo.delete({});
  }

  async findAll(): Promise<SteamGenerationRecord[]> {
    return this.steamGenRepo.find({
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
      order: { createdAt: 'ASC'},
    });
  }

  async findOne(id: string): Promise<SteamGenerationRecord> {
    const record = await this.steamGenRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  // find based on shift Schedule ID
  async findByShiftScheduleId(shiftId: string): Promise<SteamGenerationRecord[]> {
    return this.steamGenRepo.find({
      where: { shiftSchedule: { id: shiftId } },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
  }

  async update(
    id: string,
    updateData: UpdateSteamGenerationDto,
    userId: string,
  ): Promise<SteamGenerationRecord> {
    const steamGenRecord = await this.steamGenRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!steamGenRecord) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    // If shiftId is provided, fetch and set the new ShiftSchedule
    if (updateData.shiftId) {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: updateData.shiftId } });
      if (!shiftSchedule) {
        throw new NotFoundException('Shift Schedule not found');
      }
      steamGenRecord.shiftSchedule = shiftSchedule;
    }

    // Update other fields
    if (updateData.initialReading !== undefined) {
      steamGenRecord.initialReading = updateData.initialReading;
    }
    if (updateData.finalReading !== undefined) {
      steamGenRecord.finalReading = updateData.finalReading;
    }
    if (updateData.remarks !== undefined) {
      steamGenRecord.remarks = updateData.remarks;
    }

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
