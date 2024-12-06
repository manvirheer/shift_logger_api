import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, In, LessThanOrEqual, MoreThanOrEqual, LessThan, MoreThan } from 'typeorm';
  // Entities
  import {
    ShiftAssignment,
    ValidationStatus,
  } from './entities/shift-assignment.entity';
  import { ShiftSchedule, ShiftStatus } from '../shift-schedule/entities/shift-schedule.entity';
  import { User, UserRole } from 'src/user/entities/user.entity';
  // DTOs
  import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
  import { UpdateShiftAssignmentDto } from './dtos/update-shift-assignment.dto';
import * as moment from 'moment';
import { Plant } from 'src/plant/entities/plant.entity';
  
  @Injectable()
  export class ShiftAssignmentService {
    constructor(
      @InjectRepository(ShiftAssignment)
      private readonly shiftAssignmentRepo: Repository<ShiftAssignment>,
      @InjectRepository(ShiftSchedule)
      private readonly shiftScheduleRepo: Repository<ShiftSchedule>,
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,
      @InjectRepository(Plant)
      private readonly plantRepo: Repository<Plant>,
    ) {}
  
    async createShiftAssignment(
      data: CreateShiftAssignmentDto,
      assignedById: string,
    ): Promise<ShiftAssignment> {
      const shiftSchedule = await this.shiftScheduleRepo.findOne({
        where: { id: data.shiftScheduleId },
        relations: ['plant'],
      })

      console.log(' Shift Schedule passed to createShiftAssignment', shiftSchedule);
  
      if (!shiftSchedule) {
        throw new NotFoundException('Shift Schedule not found');
      }
  
      const user = await this.userRepo.findOne({ where: { id: data.userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const assignedBy = await this.userRepo.findOne({ where: { id: assignedById } });
      if (!assignedBy) {
        throw new NotFoundException('Assigned by user not found');
      }
  
      // Prevent assigning shifts to admins
      if (user.role === UserRole.ADMIN) {
        throw new ForbiddenException('Admins cannot be assigned to shifts');
      }
  
      // Check for overlapping assignments with Planned or Attended shifts
      const overlappingAssignment = await this.shiftAssignmentRepo.findOne({
        where: {
          user: { id: user.id },
          shiftSchedule: {
            status: In([ShiftStatus.PLANNED, ShiftStatus.ATTENDED]),
            startTime: LessThan(shiftSchedule.endTime),
            endTime: MoreThan(shiftSchedule.startTime),
          },
        },  
        relations: ['shiftSchedule'],
      });
  
      if (overlappingAssignment) {
        console.log('overlappingAssignment', overlappingAssignment);
        throw new BadRequestException('User already assigned to an overlapping shift');
      }
  
      // Determine if validation is required (e.g., if self-assigned)
      const requiresValidation =
        data.requiresValidation !== undefined
          ? data.requiresValidation
          : assignedById === data.userId; // Requires validation if self-assigned
  
      const validationStatus = requiresValidation
        ? ValidationStatus.PENDING
        : ValidationStatus.APPROVED;
  
      const shiftAssignment = this.shiftAssignmentRepo.create({
        shiftSchedule,
        user,
        assignedBy,
        requiresValidation,
        validationStatus,
      });
  
      return this.shiftAssignmentRepo.save(shiftAssignment);
    }
  
    async getAllShiftAssignments(): Promise<ShiftAssignment[]> {
      return this.shiftAssignmentRepo.find({
        relations: ['shiftSchedule', 'user', 'assignedBy', 'validatedBy'],
      });
    }
  
    async getShiftAssignmentsByShiftScheduleId(
      shiftScheduleId: string,
    ): Promise<ShiftAssignment[]> {
      return this.shiftAssignmentRepo.find({
        where: { shiftSchedule: { id: shiftScheduleId } },
        relations: ['shiftSchedule', 'user', 'assignedBy', 'validatedBy'],
      });
    }
  
    async getShiftAssignmentsByUserId(
      userId: string,
    ): Promise<ShiftAssignment[]> {
      return this.shiftAssignmentRepo.find({
        where: { user: { id: userId } },
        relations: ['shiftSchedule', 'user', 'assignedBy', 'validatedBy'],
      });
    }
  
    async getCurrentShiftAssignments(
      plantId: string,
    ): Promise<ShiftAssignment[]> {
      try {
  
        // Ensure the plant exists
        const plant = await this.plantRepo.findOne({ where: { plantId } });
        if (!plant) {
          throw new NotFoundException(`Plant with ID ${plantId} not found`);
        }
  
        // Get the current time using moment for consistency
        const currentTime = moment().toDate();
  
        // Define the statuses that qualify a shift as active
        const activeStatuses = [ShiftStatus.PLANNED, ShiftStatus.ATTENDED];
        // Use QueryBuilder to query ShiftSchedule with joins and conditions
         // Use QueryBuilder to query ShiftAssignment with joins and conditions
         const activeShiftSchedules = await this.shiftAssignmentRepo
         .createQueryBuilder('shiftAssignment')
         // have the entire shiftAssignment relation
          .leftJoinAndSelect('shiftAssignment.user', 'user')
          // join plant through shift schedule
          .innerJoinAndSelect('shiftAssignment.shiftSchedule', 'shiftSchedule')
          .leftJoinAndSelect('shiftSchedule.plant', 'plant')
         .andWhere('shiftSchedule.status IN (\'Planned\', \'Attended\')', { activeStatuses })
         .andWhere('shiftSchedule.startTime <= :currentTime', { currentTime })
         .andWhere('shiftSchedule.endTime >= :currentTime', { currentTime })
         .getMany();
  
  
        return activeShiftSchedules;
      } catch (error) {
        throw new InternalServerErrorException(
          'Failed to retrieve current shift schedules for the plant.',
        );
      }
    }
    
    async updateShiftAssignment(
      id: string,
      data: UpdateShiftAssignmentDto,
      userId: string,
    ): Promise<ShiftAssignment> {
      const shiftAssignment = await this.shiftAssignmentRepo.findOne({
        where: { id },
        relations: ['shiftSchedule', 'user', 'assignedBy', 'validatedBy'],
      });
  
      if (!shiftAssignment) {
        throw new NotFoundException(`Shift Assignment with ID ${id} not found`);
      }
  
      // Fetch the user performing the update
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      if (data.validationStatus) {
        // Only allow admins or managers to approve/reject
        if (user.role !== UserRole.ADMIN) {
          throw new ForbiddenException('You do not have permission to validate assignments');
        }
  
        shiftAssignment.validationStatus = data.validationStatus;
  
        if (data.validationStatus === ValidationStatus.APPROVED) {
          shiftAssignment.validatedBy = user;
        } else if (data.validationStatus === ValidationStatus.REJECTED) {
          // Optionally, handle rejection logic
          shiftAssignment.validatedBy = user;
        }
      }
  
      return this.shiftAssignmentRepo.save(shiftAssignment);
    }
  
    async deleteShiftAssignment(id: string): Promise<void> {
      const result = await this.shiftAssignmentRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Shift Assignment with ID ${id} not found`);
      }
    }
  }
  