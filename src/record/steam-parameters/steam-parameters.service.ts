import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SteamParameters } from './entities/steam-parameters.entity';
import { CreateSteamParametersDto } from './dtos/create-steam-parameters.dto';
import { UpdateSteamParametersDto } from './dtos/update-steam-parameters.dto';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';

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

    return this.steamParametersRepo.save(steamParameters);
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

  async update(
    id: string,
    data: UpdateSteamParametersDto,
    userId: string,
  ): Promise<SteamParameters> {
    const steamParameters = await this.steamParametersRepo.findOne({
      where: { id },
    });
    if (!steamParameters)
      throw new NotFoundException(
        `Steam Parameters record with ID ${id} not found`,
      );

    if (data.plantId) {
      const plant = await this.plantRepo.findOne({
        where: { plantId: data.plantId },
      });
      if (!plant) throw new NotFoundException('Plant not found');
      steamParameters.plant = plant;
    }

    if (data.shiftScheduleId) {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({
        where: { id: data.shiftScheduleId },
      });
      if (!shiftSchedule)
        throw new NotFoundException('Shift Schedule not found');
      steamParameters.shiftSchedule = shiftSchedule;
    }

    Object.assign(steamParameters, data);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    steamParameters.updatedBy = user;

    return this.steamParametersRepo.save(steamParameters);
  }

  async remove(id: string): Promise<void> {
    const result = await this.steamParametersRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(
        `Steam Parameters record with ID ${id} not found`,
      );
  }
}
