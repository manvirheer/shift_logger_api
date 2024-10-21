import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRecord } from './entities/activity-record.entity';
import { CreateActivityDto } from './dtos/create-activity.dto';
import { UpdateActivityDto } from './dtos/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRepo: Repository<ActivityRecord>,
  ) {}

  async create(data: CreateActivityDto): Promise<ActivityRecord> {
    const activityRecord = this.activityRepo.create(data);
    return this.activityRepo.save(activityRecord);
  }

  async findAll(): Promise<ActivityRecord[]> {
    return this.activityRepo.find();
  }

  async findOne(id: string): Promise<ActivityRecord> {
    const record = await this.activityRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }
    return record;
  }

  async update(
    id: string,
    updateData: UpdateActivityDto,
  ): Promise<ActivityRecord> {
    const activityRecord = await this.activityRepo.findOne({ where: { id } });
    if (!activityRecord) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }

    Object.assign(activityRecord, updateData);

    return this.activityRepo.save(activityRecord);
  }

  async remove(id: string): Promise<void> {
    const result = await this.activityRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }
  }
}
