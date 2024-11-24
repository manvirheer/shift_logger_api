import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Ash } from './entities/ash.entity';
import { CreateAshDto } from './dtos/create-ash.dto';
import { UpdateAshDto } from './dtos/update-ash.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

@Injectable()
export class AshService {
  constructor(
    @InjectRepository(Ash)
    private readonly ashGenRepo: Repository<Ash>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    private readonly dataEntryPeriodService: DataEntryPeriodService,
  ) { }

  async create(data: CreateAshDto, userId: string): Promise<Ash> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) throw new NotFoundException('Plant not found');

    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
    if (!shiftSchedule) throw new NotFoundException('Shift Schedule not found');

    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());

    const ashGeneration = this.ashGenRepo.create({
      ...data,
      createdBy: user,
      plant,
      shiftSchedule,
      updatedBy: null,
      entryPeriod,
      entryDate
    });

    return this.ashGenRepo.save(ashGeneration);
  }

  async findAll(params: any): Promise<Ash[]> {
    const whereConditions: FindManyOptions<Ash>['where'] = {
      ...(params.shiftScheduleId && { shiftSchedule: { id: params.shiftScheduleId } }),
      ...(params.plantId && { plant: { plantId: params.plantId } }),
      ...(params.createdById && { createdBy: { id: params.createdById } }),
    };

    return this.ashGenRepo.find({
      where: whereConditions,
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Ash> {
    const record = await this.ashGenRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!record) throw new NotFoundException(`Ash Generation record with ID ${id} not found`);
    return record;
  }

  async update(id: string, data: UpdateAshDto, userId: string): Promise<Ash> {
    const ashGeneration = await this.ashGenRepo.findOne({ where: { id } });
    if (!ashGeneration) throw new NotFoundException(`Ash Generation record with ID ${id} not found`);

    if (data.plantId) {
      const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
      if (!plant) throw new NotFoundException('Plant not found');
      ashGeneration.plant = plant;
    }

    if (data.shiftScheduleId) {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id: data.shiftScheduleId } });
      if (!shiftSchedule) throw new NotFoundException('Shift Schedule not found');
      ashGeneration.shiftSchedule = shiftSchedule;
    }

    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(ashGeneration.plant.plantId, new Date());

    ashGeneration.entryPeriod = entryPeriod;
    ashGeneration.entryDate = entryDate;
    
    Object.assign(ashGeneration, data);


    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    ashGeneration.updatedBy = user;

    return this.ashGenRepo.save(ashGeneration);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ashGenRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Ash Generation record with ID ${id} not found`);
  }
}
