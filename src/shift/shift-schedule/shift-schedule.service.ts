import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
// Entities
import { ShiftSchedule, ShiftTitle } from './entities/shift-schedule.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { User } from '../../user/entities/user.entity';
// DTOs
import { CreateShiftScheduleDto } from './dtos/create-shift-schedule.dto';
import { UpdateShiftScheduleDto } from './dtos/update-shift-schedule.dto';
import { ShiftPosting } from '../shift-posting/entities/shift-posting.entity';

@Injectable()
export class ShiftScheduleService {
  constructor(
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async createShiftSchedule(
    data: CreateShiftScheduleDto,
    userId: string,
  ): Promise<ShiftSchedule> {
    const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for existing shift schedule with the same date and shift title
    const existingShiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { date: data.date, shiftTitle: data.shiftTitle },
    });
    if (existingShiftSchedule) {
      throw new BadRequestException(
        `Shift Schedule for date ${data.date} and shift title ${data.shiftTitle} already exists`,
      );
    }

    const shiftSchedule = this.shiftScheduleRepo.create({
      shiftTitle: data.shiftTitle,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      plant,
      createdBy: user,
    });
    return this.shiftScheduleRepo.save(shiftSchedule);
  }

  async getAllShiftSchedules(date?: string, plantId?: string, shiftTitle?: string): Promise<ShiftSchedule[]> {
    const query = this.shiftScheduleRepo.createQueryBuilder('shiftSchedule')
      .leftJoinAndSelect('shiftSchedule.plant', 'plant')
      .leftJoinAndSelect('shiftSchedule.createdBy', 'createdBy')
      .leftJoinAndSelect('shiftSchedule.updatedBy', 'updatedBy');

    if (date) {
      query.andWhere('shiftSchedule.date = :date', { date });
    }

    if (plantId) {
      query.andWhere('plant.plantId = :plantId', { plantId });
    }

    if (shiftTitle) {
      query.andWhere('shiftSchedule.shiftTitle = :shiftTitle', { shiftTitle });
    }

    return query.getMany();
  }

  async getShiftScheduleById(id: string): Promise<ShiftSchedule> {
    const shiftSchedule = await this.shiftScheduleRepo.findOne({
      where: { id },
      relations: ['plant', 'createdBy', 'updatedBy'],
    });
    if (!shiftSchedule) {
      throw new NotFoundException(`Shift Schedule with ID ${id} not found`);
    }
    return shiftSchedule;
  }

  async getShiftSchedulesByDate(date: string): Promise<ShiftSchedule[]> {
    return this.shiftScheduleRepo.find({
      where: { date },
      relations: ['plant', 'createdBy', 'updatedBy'],
    });
  }
  async getActiveShiftSchedules(): Promise<ShiftSchedule[]> {
    // Adjust to Indian Standard Time (IST) UTC+5:30
    const currentDate = new Date();
    currentDate.setHours(currentDate.getUTCHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);

    const currentTimeString = currentDate.toTimeString().slice(0, 8); // Format as HH:MM:SS
    console.log(`Current IST Time: ${currentTimeString}`);

    let lookingForDate = new Date(currentDate); // Clone the current date
    let lookingForShift: ShiftTitle;

    // Determine the shift and date to look for based on the current time
    if (currentTimeString < "06:00:00") {
      lookingForDate.setDate(lookingForDate.getDate() - 1); // Previous day
      lookingForShift = ShiftTitle.C;
    } else if (currentTimeString >= "06:00:00" && currentTimeString < "14:00:00") {
      lookingForShift = ShiftTitle.A;
    } else if (currentTimeString >= "14:00:00" && currentTimeString < "22:00:00") {
      lookingForShift = ShiftTitle.B;
    } else {
      lookingForShift = ShiftTitle.C;
    }

    const dateString = lookingForDate.toISOString().slice(0, 10); // Format date as YYYY-MM-DD

    // Fetch shift schedules for the determined date and shift title
    return this.shiftScheduleRepo.find({
      where: { date: dateString, shiftTitle: lookingForShift },
      relations: ['plant', 'createdBy', 'updatedBy'],
    });
  }

  async updateShiftSchedule(
    id: string,
    data: UpdateShiftScheduleDto,
    userId: string,
  ): Promise<ShiftSchedule> {
    const shiftSchedule = await this.shiftScheduleRepo.findOne({ where: { id } });
    if (!shiftSchedule) {
      throw new NotFoundException(`Shift Schedule with ID ${id} not found`);
    }

    // If date or shiftTitle is being updated, check for existing schedule
    const newDate = data.date || shiftSchedule.date;
    const newShiftTitle = data.shiftTitle || shiftSchedule.shiftTitle;

    const existingShiftSchedule = await this.shiftScheduleRepo.findOne({
      where: {
        date: newDate,
        shiftTitle: newShiftTitle,
        id: Not(id), // Exclude the current shift schedule
      },
    });
    if (existingShiftSchedule) {
      throw new BadRequestException(
        `Shift Schedule for date ${newDate} and shift title ${newShiftTitle} already exists`,
      );
    }

    if (data.plantId) {
      const plant = await this.plantRepo.findOne({ where: { plantId: data.plantId } });
      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
      shiftSchedule.plant = plant;
    }

    Object.assign(shiftSchedule, data);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    shiftSchedule.updatedBy = user;

    return this.shiftScheduleRepo.save(shiftSchedule);
  }


  async deleteShiftSchedule(id: string): Promise<void> {
    const result = await this.shiftScheduleRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shift Schedule with ID ${id} not found`);
    }
  }

  // delete all the shift schedules
  async deleteAllShiftSchedules(): Promise<void> {
    // delete all the shift postings
    await this.shiftScheduleRepo.delete({});
  }
}