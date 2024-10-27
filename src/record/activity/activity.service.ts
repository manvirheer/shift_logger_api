import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRecord } from './entities/activity-record.entity';
import { CreateActivityDto } from './dtos/create-activity.dto';
import { UpdateActivityDto } from './dtos/update-activity.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRepo: Repository<ActivityRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
  ) {}

  async create(data: CreateActivityDto, userId: string): Promise<ActivityRecord> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const activityRecord = this.activityRepo.create({
      ...data,
      createdBy: user,
      plant: plant,
      updatedBy: null,
    });

    return this.activityRepo.save(activityRecord);
  }

  async findAll(): Promise<ActivityRecord[]> {
    return this.activityRepo.find({
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
  }

  async findOne(id: string): Promise<ActivityRecord> {
    const record = await this.activityRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
    if (!record) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, updateData: UpdateActivityDto, userId: string): Promise<ActivityRecord> {
    const activityRecord = await this.activityRepo.findOne({ where: { id } });
    if (!activityRecord) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }

    Object.assign(activityRecord, updateData);

    // Update the updatedBy field
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    activityRecord.updatedBy = user;

    await this.activityRepo.save(activityRecord);
    return activityRecord;
  }

  async remove(id: string): Promise<void> {
    const result = await this.activityRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity record with ID ${id} not found`);
    }
  }
}
