import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Entities
import { ShiftPosting } from './entities/shift-posting.entity';
import { ShiftSchedule } from '../shift-schedule/entities/shift-schedule.entity';
import { User, UserRole } from '../../user/entities/user.entity';
// DTOs
import { CreateShiftPostingDto } from './dtos/create-shift-posting.dto';
import { UpdateShiftPostingDto } from './dtos/update-shift-posting.dto';

@Injectable()
export class ShiftPostingService {
    constructor(
        @InjectRepository(ShiftPosting)
        private readonly shiftPostingRepo: Repository<ShiftPosting>,
        @InjectRepository(ShiftSchedule)
        private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async createShiftPosting(
        data: CreateShiftPostingDto,
        userId: string,
    ): Promise<ShiftPosting> {
        const shiftSchedule = await this.shiftScheduleRepo.findOne({
            where: { id: data.shiftScheduleId },
            relations: ['plant'],
        });

        if (!shiftSchedule) {
            throw new NotFoundException('Shift Schedule not found');
        }

        const staff = await this.userRepo.findOneBy({ id: data.staffId });
        if (!staff) {
            throw new NotFoundException('Staff member not found');
        }

        if (staff.role === UserRole.ADMIN) {
            throw new ForbiddenException('Admins cannot be assigned shifts');
        }

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const shiftPosting = this.shiftPostingRepo.create({
            shiftSchedule,
            staff,
            createdBy: user,
        });

        return this.shiftPostingRepo.save(shiftPosting);
    }

    async getAllShiftPostings(): Promise<ShiftPosting[]> {
        return this.shiftPostingRepo.find({
            relations: ['shiftSchedule', 'shiftSchedule.plant', 'staff', 'createdBy', 'updatedBy'],
        });
    }

    async getShiftPostingsByPlantId(plantId: string): Promise<ShiftPosting[]> {
        const shiftPosting = await this.shiftPostingRepo.find({
            where: { shiftSchedule: { plant: { plantId } } },
            relations: ['shiftSchedule', 'staff'],
        });
        if (!shiftPosting) {
            throw new NotFoundException('Shift Posting not found');
        }
        return shiftPosting;
    }

    async updateShiftPosting(
        id: string,
        data: UpdateShiftPostingDto,
        userId: string,
    ): Promise<ShiftPosting> {
        const shiftPosting = await this.shiftPostingRepo.findOneBy({ id });
        if (!shiftPosting) {
            throw new NotFoundException(`Shift Posting with ID ${id} not found`);
        }

        if (data.shiftScheduleId) {
            const shiftSchedule = await this.shiftScheduleRepo.findOneById(data.shiftScheduleId);
            if (!shiftSchedule) {
                throw new NotFoundException('Shift Schedule not found');
            }
            shiftPosting.shiftSchedule = shiftSchedule;
        }

        if (data.staffId) {
            const staff = await this.userRepo.findOneBy({ id: data.staffId });
            if (!staff) {
                throw new NotFoundException('Staff member not found');
            }
            if (staff.role === UserRole.ADMIN) {
                throw new ForbiddenException('Admins cannot be assigned shifts');
            }
            shiftPosting.staff = staff;
        }

        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        shiftPosting.updatedBy = user;

        return this.shiftPostingRepo.save(shiftPosting);
    }

    async deleteShiftPosting(id: string): Promise<void> {
        const result = await this.shiftPostingRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Shift Posting with ID ${id} not found`);
        }
    }

    async deleteAllShiftPostings(): Promise<void> {
        await this.shiftPostingRepo.clear();
    }
}
