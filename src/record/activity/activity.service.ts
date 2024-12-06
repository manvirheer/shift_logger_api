import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRecord } from './entities/activity-record.entity';
import { CreateActivityDto } from './dtos/create-activity.dto';
import { UpdateActivityDto } from './dtos/update-activity.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRecord)
    private readonly activityRepo: Repository<ActivityRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    private readonly dataEntryPeriodService: DataEntryPeriodService, 
  ) { }

  async create(data: CreateActivityDto, userId: string): Promise<ActivityRecord> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }
    
    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
    
    // Fetch the entry period using DataEntryPeriodService
    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());
    
    const activityRecord = this.activityRepo.create({
      ...data,
      createdBy: user,
      plant: plant,
      shiftSchedule: shiftSchedule,
      entryPeriod, 
      entryDate,
      updatedBy: null,
    });
    
    return this.activityRepo.save(activityRecord);
  }
  
  async findAll(): Promise<ActivityRecord[]> {
    return this.activityRepo.find({
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
      order: { createdAt: 'ASC' },
    });
  }
  
  async findOne(activityId: string): Promise<ActivityRecord> {
    const record = await this.activityRepo.findOne({
      where: { activityId },
      relations: ['createdBy', 'updatedBy', 'plant'],
    });
    if (!record) {
      throw new NotFoundException(`Activity record with ID ${activityId} not found`);
    }
    return record;
  }
  
  async update(activityId: string, updateData: UpdateActivityDto, userId: string): Promise<ActivityRecord> {
    const activityRecord = await this.activityRepo.findOne({ where: { activityId }, relations: ['plant'] });
    console.log('activityRecord', activityRecord);
    console.log('updateData', updateData);
    if (!activityRecord) {
      throw new NotFoundException(`Activity record with ID ${activityId} not found`);
    }
    
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If entry period needs updating, fetch it again
    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(activityRecord.plant.plantId, new Date());

    Object.assign(activityRecord, updateData, { entryPeriod, entryDate, updatedBy: user });

    return this.activityRepo.save(activityRecord);
  }

  async remove(activityId: string): Promise<void> {
    const result = await this.activityRepo.delete(activityId);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity record with ID ${activityId} not found`);
    }
  }
}
