import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamParameters } from './entities/steam-parameters.entity';
import { CreateSteamParametersDto } from './dtos/create-steam-parameters.dto';
import { UpdateSteamParametersDto } from './dtos/update-steam-parameters.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';

@Injectable()
export class SteamParametersService {
  constructor(
    @InjectRepository(SteamParameters)
    private readonly steamParametersRepo: Repository<SteamParameters>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    private readonly dataEntryPeriodService: DataEntryPeriodService,
  ) {}

  async create(
    data: CreateSteamParametersDto,
    userId: string,
  ): Promise<SteamParameters> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plant = await this.plantRepo.findOne({
      where: { plantId: data.plantId },
    });
    if (!plant) throw new NotFoundException('Plant not found');

    const shiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { id: data.shiftScheduleId },
    });
    if (!shiftSchedule)
      throw new NotFoundException('Shift Schedule not found');

    const steamParameters = this.steamParametersRepo.create({
      ...data,
      createdBy: user,
      plant,
      shiftSchedule,
    });


    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(plant.plantId, new Date());

    steamParameters.entryPeriod = entryPeriod;
    steamParameters.entryDate = entryDate;
    return this.steamParametersRepo.save(steamParameters);
  }

  async createSteamParametersForShift(
    plantId: string,
    shiftScheduleId: string,
    userId: string,
  ): Promise<SteamParameters[]> {
    // Retrieve ShiftSchedule
    const shiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { id: shiftScheduleId },
    });
    if (!shiftSchedule)
      throw new NotFoundException('Shift Schedule not found');

    // Determine start hour based on shiftTitle
    let startHour: number;
    let entryPeriod: string;

    switch (shiftSchedule.shiftTitle) {
      case 'A':
        startHour = 7;
        entryPeriod = 'A';
        break;
      case 'B':
        startHour = 15;
        entryPeriod = 'B';
        break;
      case 'C':
        startHour = 23;
        entryPeriod = 'C';
        break;
      default:
        throw new BadRequestException('Invalid Shift Title');
    }



    const createdEntries: SteamParameters[] = [];

    for (let i = 0; i < 8; i++) {
      // Calculate new hour with wrap-around using modulo 24
      const currentHour = (startHour + i) % 24;
      const timeStart = `${String(currentHour).padStart(2, '0')}:00:00`;

      // Prepare CreateSteamParametersDto
      const createDto: CreateSteamParametersDto = {
        plantId,
        shiftScheduleId,
        timeStart,
      };

      // Create and save the SteamParameters entry using existing create method
      const createdEntry = await this.create(createDto, userId);
      createdEntries.push(createdEntry);
    }

    return createdEntries;
  }

  async findAll(params: any): Promise<SteamParameters[]> {
    const whereConditions = {
      ...(params.shiftScheduleId && {
        shiftSchedule: { id: params.shiftScheduleId },
      }),
      ...(params.plantId && { plant: { plantId: params.plantId } }),
      ...(params.createdById && { createdBy: { id: params.createdById } }),
    };

    return this.steamParametersRepo.find({
      where: whereConditions,
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SteamParameters> {
    const record = await this.steamParametersRepo.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'plant', 'shiftSchedule'],
    });
    if (!record)
      throw new NotFoundException(
        `Steam Parameters record with ID ${id} not found`,
      );
    return record;
  }

  async findByDate(date: string): Promise<SteamParameters[]> {

    const steamParameters = await this.steamParametersRepo.find({
    
      relations: ['shiftSchedule'],
      order: {
        shiftSchedule: {
          shiftTitle: 'ASC',
        },
        timeStart: 'ASC',
      },
    });

    if (!steamParameters || steamParameters.length === 0) {
      throw new NotFoundException(`No Steam Parameters found for date ${date}`);
    }

    return steamParameters;
  }

  async update(
    id: string,
    data: UpdateSteamParametersDto,
    userId: string,
  ): Promise<SteamParameters> {
    const steamParameters = await this.steamParametersRepo.findOne({
      where: { id },
    });
    
    Object.assign(steamParameters, data);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const {entryPeriod, entryDate} = await this.dataEntryPeriodService.findPeriodForTime(steamParameters.plant.plantId, new Date());
    steamParameters.entryPeriod = entryPeriod;
    steamParameters.entryDate = entryDate;
    steamParameters.updatedBy = user;

    return this.steamParametersRepo.save(steamParameters);
  }

  async bulkUpdate(
    updates: UpdateSteamParametersDto[],
    userId: string,
  ): Promise<void> {
    await this.steamParametersRepo.manager.transaction(async (manager) => {
      for (const updateDto of updates) {
        const { id, ...data } = updateDto;
        const result = await manager.update(SteamParameters, id, {
          ...data,
          updatedBy: { id: userId },
        });
        if (result.affected === 0) {
          throw new NotFoundException(`Steam Parameter with ID ${id} not found`);
        }
      }
    });
  }
  

  async remove(id: string): Promise<void> {
    const result = await this.steamParametersRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(
        `Steam Parameters record with ID ${id} not found`,
      );
  }
}
