// src/shift/shift-template/shift-schedule.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import * as moment from 'moment'; // Importing moment library

// Entities
import { ShiftSchedule, ShiftStatus } from './entities/shift-schedule.entity';
import { ShiftTemplate, ShiftType } from '../shift-template/entities/shift-template.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { User } from 'src/user/entities/user.entity';

// DTOs
import { CreateShiftScheduleDto } from './dtos/create-shift-schedule.dto';
import { UpdateShiftScheduleDto } from './dtos/update-shift-schedule.dto';

// Services
import { ShiftAssignmentService } from '../shift-assignment/shift-assignment.service';
import { ShiftAssignment } from '../shift-assignment/entities/shift-assignment.entity';
import { ShiftTemplateService } from '../shift-template/shift-template.service';

export enum ShiftAssignmentResponseType {
  CURRENT_SHIFT = 'alreadyAssignedToCurrentShift',
  AVAILABLE_LONG_SHIFTS = 'previousShiftWithinHours',
  AVAILABLE_STANDARD_SHIFTS = 'availableAllShifts',
  NO_AVAILABLE_SHIFTS = 'noAvailableShifts',
}

@Injectable()
export class ShiftScheduleService {

  constructor(
    @InjectRepository(ShiftSchedule)
    private readonly shiftScheduleRepo: Repository<ShiftSchedule>,

    @InjectRepository(ShiftTemplate)
    private readonly shiftTemplateRepo: Repository<ShiftTemplate>,

    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentRepo: Repository<ShiftAssignment>,

    private readonly shiftAssignmentService: ShiftAssignmentService,

    private readonly shiftTemplateService: ShiftTemplateService,
  ) { }

  async createShiftSchedule(
    data: CreateShiftScheduleDto,
    userId: string,
  ): Promise<ShiftSchedule> {
    // Fetch Plant
    const plant = await this.plantRepo.findOne({
      where: { plantId: data.plantId },
    });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }

    // Fetch User
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let shiftTemplate: ShiftTemplate | undefined;
    let startTime: Date;
    let endTime: Date;
    let shiftTitle: string;

    if (data.shiftTemplateId) {
      // Template-based shift
      shiftTemplate = await this.shiftTemplateService.getShiftTemplateById(data.shiftTemplateId);
      if (!shiftTemplate) {
        throw new NotFoundException('Shift Template not found');
      }

      if (!data.date) {
        throw new BadRequestException('Date is required when using a shift template');
      }

      // Parse the provided date
      const date = moment(data.date, 'YYYY-MM-DD');
      if (!date.isValid()) {
        throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
      }

      // Combine date with default start and end times using moment
      startTime = moment(`${data.date}T${shiftTemplate.defaultStartTime}`, moment.ISO_8601).toDate();
      endTime = moment(`${data.date}T${shiftTemplate.defaultEndTime}`, moment.ISO_8601).toDate();

      // Handle shifts that span midnight
      if (endTime <= startTime) {
        endTime = moment(endTime).add(1, 'day').toDate();
      }

      // Set shiftTitle from DTO or inherit from ShiftTemplate
      shiftTitle = data.shiftTitle || shiftTemplate.name;
    } else {
      // Custom shift
      if (!data.startTime || !data.endTime) {
        throw new BadRequestException('startTime and endTime are required for custom shifts');
      }

      // Parse startTime and endTime using moment
      const parsedStartTime = moment(data.startTime, moment.ISO_8601, true);
      const parsedEndTime = moment(data.endTime, moment.ISO_8601, true);

      if (!parsedStartTime.isValid()) {
        throw new BadRequestException('Invalid startTime format. Expected ISO 8601 format.');
      }

      if (!parsedEndTime.isValid()) {
        throw new BadRequestException('Invalid endTime format. Expected ISO 8601 format.');
      }

      startTime = parsedStartTime.toDate();
      endTime = parsedEndTime.toDate();

      if (!data.shiftTitle) {
        throw new BadRequestException('shiftTitle is required for custom shifts');
      }

      shiftTitle = data.shiftTitle;

      // Validate that endTime is after startTime
      if (endTime <= startTime) {
        throw new BadRequestException('endTime must be after startTime');
      }
    }

    // Create ShiftSchedule entity
    const shiftSchedule = this.shiftScheduleRepo.create({
      shiftTitle,
      startTime,
      endTime,
      shiftTemplate,
      plant,
      date: data.date,
      createdBy: user,
      status: ShiftStatus.PLANNED,
    });

    // Save ShiftSchedule to the database
    return this.shiftScheduleRepo.save(shiftSchedule);
  }

  async getAllShiftSchedules(
    startTime?: string,
    endTime?: string,
    plantId?: string,
    shiftTitle?: string,
  ): Promise<ShiftSchedule[]> {
    const query = this.shiftScheduleRepo
      .createQueryBuilder('shiftSchedule')
      .leftJoinAndSelect('shiftSchedule.plant', 'plant')
      .leftJoinAndSelect('shiftSchedule.createdBy', 'createdBy')
      .leftJoinAndSelect('shiftSchedule.updatedBy', 'updatedBy')
      .leftJoinAndSelect('shiftSchedule.shiftTemplate', 'shiftTemplate');

    if (startTime && endTime) {
      const parsedStartTime = moment(startTime, moment.ISO_8601, true);
      const parsedEndTime = moment(endTime, moment.ISO_8601, true);

      if (!parsedStartTime.isValid() || !parsedEndTime.isValid()) {
        throw new BadRequestException('Invalid startTime or endTime format. Expected ISO 8601 format.');
      }

      query.andWhere('shiftSchedule.startTime >= :startTime', {
        startTime: parsedStartTime.toDate(),
      });
      query.andWhere('shiftSchedule.endTime <= :endTime', {
        endTime: parsedEndTime.toDate(),
      });
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
      relations: [
        'plant',
        'createdBy',
        'updatedBy',
        'shiftTemplate',
        'shiftAssignments',
      ],
    });
    if (!shiftSchedule) {
      throw new NotFoundException(`Shift Schedule with ID ${id} not found`);
    }
    return shiftSchedule;
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
       // have the shiftSchedule relation
       .innerJoinAndSelect('shiftAssignment.shiftSchedule', 'shiftSchedule')
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

  async updateShiftSchedule(
    id: string,
    data: UpdateShiftScheduleDto,
    userId: string,
  ): Promise<ShiftSchedule> {
    const shiftSchedule = await this.getShiftScheduleById(id);

    if (data.plantId) {
      const plant = await this.plantRepo.findOne({
        where: { plantId: data.plantId },
      });
      if (!plant) {
        throw new NotFoundException('Plant not found');
      }
      shiftSchedule.plant = plant;
    }

    if (data.shiftTemplateId) {
      const shiftTemplate = await this.shiftTemplateService.getShiftTemplateById(data.shiftTemplateId);
      if (!shiftTemplate) {
        throw new NotFoundException('Shift Template not found');
      }
      shiftSchedule.shiftTemplate = shiftTemplate;
    }

    if (data.startTime) {
      shiftSchedule.startTime = new Date(data.startTime);
    }

    if (data.endTime) {
      shiftSchedule.endTime = new Date(data.endTime);
    }

    if (data.shiftTitle) {
      shiftSchedule.shiftTitle = data.shiftTitle;
    }

    if (data.date) {
      shiftSchedule.date = data.date;
    }

    if (data.status) {
      shiftSchedule.status = data.status as ShiftStatus;
    }

    if (data.statusDescription) {
      shiftSchedule.statusDescription = data.statusDescription;
    }

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

  async handleUserShiftAssignment(
    userId: string
  ): Promise<{ type: ShiftAssignmentResponseType; data: ShiftSchedule | ShiftTemplate[] | string }> {
    try {
      // Step 1: Check if user is currently assigned to a shift
      const currentShift: ShiftSchedule | null = await this.getCurrentShiftForUser(userId);
      if (currentShift) {
        console.log('User is already assigned to a current shift.');
        return {
          type: ShiftAssignmentResponseType.CURRENT_SHIFT,
          data: currentShift,
        };
      }

      // Step 2: Check for previous shift within 4 hours
      const previousShift: ShiftSchedule | null = await this.getPreviousShiftWithinHours(userId, 4);
      if (previousShift) {
        // Retrieve plantId from the previous shift's plant association
        const plantId: string = previousShift.plant.plantId;

        // Step 3: Offer only long shifts based on the plantId
        const availableLongShifts: ShiftTemplate[] = await this.shiftTemplateService.findAvailableShiftTemplates(
          moment().toDate(),
          ShiftType.LONG,
          plantId,
        );

        if (availableLongShifts.length === 0) {
          return {
            type: ShiftAssignmentResponseType.NO_AVAILABLE_SHIFTS,
            data: 'No available long shifts at this time.',
          };
        }

        // Return available long shifts to the frontend
        return {
          type: ShiftAssignmentResponseType.AVAILABLE_LONG_SHIFTS,
          data: availableLongShifts,
        };
      } else {
        // Step 4: Offer standard shifts and long shifts if no previous shift is found within 4 hours

        // Retrieve the user's plantId
        const userPlantId: string = await this.getUserPlantId(userId);

        // Find available standard shifts based on the user's plantId
        const availableStandardShifts: ShiftTemplate[] = await this.shiftTemplateService.findAvailableShiftTemplates(
          moment().toDate(),
          ShiftType.STANDARD,
          userPlantId,
        );

        const availableLongShifts: ShiftTemplate[] = await this.shiftTemplateService.findAvailableShiftTemplates(
          moment().toDate(),
          ShiftType.LONG,
          userPlantId,
        );

        if (availableStandardShifts.length === 0) {
          return {
            type: ShiftAssignmentResponseType.NO_AVAILABLE_SHIFTS,
            data: 'No available standard shifts at this time.',
          };
        }

        // Return available standard shifts to the frontend
        return {
          type: ShiftAssignmentResponseType.AVAILABLE_STANDARD_SHIFTS,
          data: [...availableStandardShifts, ...availableLongShifts],
        };
      }
    } catch (error) {
      // Handle known exceptions by rethrowing them
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      // Handle unexpected errors
      throw new InternalServerErrorException('An unexpected error occurred while handling shift assignment.');
    }
  }

  private async getCurrentShiftForUser(userId: string): Promise<ShiftSchedule | null> {
    try {
      // Get the current time
      const currentTime = moment().toDate();
      const activeStatuses = [ShiftStatus.PLANNED, ShiftStatus.ATTENDED];

      // Use QueryBuilder to query ShiftAssignment with joins and conditions
      const assignment = await this.shiftAssignmentRepo
        .createQueryBuilder('shiftAssignment')
        .innerJoinAndSelect('shiftAssignment.shiftSchedule', 'shiftSchedule')
        .where('shiftAssignment.user_id = :userId', { userId })
        .andWhere('shiftSchedule.status IN (\'Planned\', \'Attended\')', { activeStatuses })
        .andWhere('shiftSchedule.startTime <= :currentTime', { currentTime })
        .andWhere('shiftSchedule.endTime >= :currentTime', { currentTime })
        .getOne();

      if (assignment && assignment.shiftSchedule) {
        return assignment.shiftSchedule;
      }

      console.log("No current shift found for user.");

      return null;
    }
    catch (error) {
      throw new InternalServerErrorException('Failed to retrieve current shift for the user.');
    }
  }

  private async getPreviousShiftWithinHours(userId: string, hours: number): Promise<ShiftSchedule | null> {

    // Validate hours
    if (!Number.isInteger(hours) || hours <= 0) {
      throw new BadRequestException('Hours must be a positive integer.');
    }

    // Calculate time range using moment for consistency
    const currentTime = moment().toDate();
    const pastTime = moment().subtract(hours, 'hours').toDate();

    // Define the statuses that qualify a shift as active
    const activeStatuses = [ShiftStatus.PLANNED, ShiftStatus.ATTENDED];

    console.log("Checking for previous shift within the last 4 hours.");
    console.log("Current Time: ", currentTime);
    console.log("Past Time: ", pastTime);
    console.log("Active Statuses: ", activeStatuses);

    try {
      const assignment = await this.shiftAssignmentRepo.findOne({
        where: {
          user: { id: userId },
          shiftSchedule: {
            endTime: Between(pastTime, currentTime),
            status: In(activeStatuses),
          },
        },
        relations: ['shiftSchedule'],
        order: { shiftSchedule: { endTime: 'DESC' } }, // Ensures the most recent shift is retrieved
      });

      return assignment ? assignment.shiftSchedule : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve previous shift for the user.');
    }
  }

  private async getUserPlantId(userId: string): Promise<string> {
    // Validate userId format
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(userId)) {
      throw new BadRequestException('Invalid userId format. Expected UUID v4.');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['plants'],
      select: {
        plants: {
          plantId: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.plants || user.plants.length === 0) {
      throw new NotFoundException(`No plant associations found for user ID ${userId}`);
    }

    return user.plants[0].plantId;
  }

  async assignShiftToUser(
    userId: string,
    shiftTemplateId: string
  ): Promise<ShiftAssignment> {
    try {
      // Step 1: Check if user is currently assigned to a shift
      const currentShift: ShiftSchedule | null = await this.getCurrentShiftForUser(userId);

      if (currentShift) {
        throw new BadRequestException('User is already assigned to a current shift.');
      }
      console.log("Stage: No current shift assigned to user.");
      // Step 2: Check for previous shift within 4 hours
      const previousShift: ShiftSchedule | null = await this.getPreviousShiftWithinHours(userId, 4);

      if (previousShift) {
        // Step 3: Update previous shift status to "Changed"
        previousShift.status = ShiftStatus.CHANGED;
        previousShift.statusDescription = 'Shift changed due to selection of a long shift.';
        await this.shiftScheduleRepo.save(previousShift);

        // Step 4: Create new shift schedule based on selected long shift template
        const newShiftSchedule: ShiftAssignment = await this.createAndAssignNewShiftSchedule(
          shiftTemplateId,
          previousShift.date || moment().format('YYYY-MM-DD'),
          userId
        );

        return newShiftSchedule;
      } else {

        console.log("Stage: No previous shift within 4 hours.");
        // Step 5: No recent shift, offer standard shifts

        // Retrieve the user's plantId
        const userPlantId: string = await this.getUserPlantId(userId);

        // Create and assign new standard shift
        const newShiftSchedule: ShiftAssignment = await this.createAndAssignNewShiftSchedule(
          shiftTemplateId,
          moment().format('YYYY-MM-DD'),
          userId,
        );

        console.log("Stage: New standard shift created and assigned to user.");
        console.log("New Shift Schedule: ", newShiftSchedule);
        return newShiftSchedule;
      }
    } catch (error) {
      // Handle known exceptions by rethrowing them
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle unexpected errors
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred while assigning the shift.');
    }
  }

  private async createAndAssignNewShiftSchedule(
    shiftTemplateId: string,
    date: string,
    userId: string,
  ): Promise<ShiftAssignment> {
    try {

      const shiftTemplate = await this.shiftTemplateService.getShiftTemplateById(shiftTemplateId);
      if (!shiftTemplate) {
        throw new NotFoundException('Shift Template not found');
      }

      // Step 1: Prepare data for createShiftSchedule
      const createShiftScheduleDto: CreateShiftScheduleDto = {
        shiftTemplateId,
        date,
        plantId: shiftTemplate.plant.plantId,
        // Optional: You can set shiftTitle here if needed
      };

      // Step 2: Call createShiftSchedule
      const newShiftSchedule = await this.createShiftSchedule(createShiftScheduleDto, userId);

      // Step 3: Assign the User to the Shift via ShiftAssignmentService
      const newShiftAssignment = await this.shiftAssignmentService.createShiftAssignment(
        {
          shiftScheduleId: newShiftSchedule.id,
          userId: userId,
        },
        userId,
      );

      return newShiftAssignment;
    } catch (error) {
      // Handle exceptions as needed
      throw error;
    }
  }

}
