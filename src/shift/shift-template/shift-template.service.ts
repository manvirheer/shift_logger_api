// src/shift/shift-template/shift-template.service.ts

import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Brackets } from 'typeorm';
  // Entities
  import { ShiftTemplate, ShiftType } from './entities/shift-template.entity';
  import { Plant } from 'src/plant/entities/plant.entity';
  // DTOs
  import { CreateShiftTemplateDto } from './dtos/create-shift-template.dto';
  import { UpdateShiftTemplateDto } from './dtos/update-shift-template.dto';
  // Utilities
  import * as moment from 'moment';
  
  @Injectable()
  export class ShiftTemplateService {
    constructor(
      @InjectRepository(ShiftTemplate)
      private readonly shiftTemplateRepo: Repository<ShiftTemplate>,
      @InjectRepository(Plant)
      private readonly plantRepo: Repository<Plant>,
    ) {}
  
    /**
     * Creates a new ShiftTemplate.
     * Automatically determines the shiftType based on the duration between defaultStartTime and defaultEndTime.
     * @param data - Data transfer object containing shift template details.
     * @returns The created ShiftTemplate entity.
     */
    async createShiftTemplate(
      data: CreateShiftTemplateDto,
    ): Promise<ShiftTemplate> {
      const { plantId, ...rest } = data;
  
      // Check if plant exists
      const plant = await this.plantRepo.findOne({ where: { plantId } });
      if (!plant) {
        throw new NotFoundException(`Plant with ID ${plantId} not found`);
      }
  
      // Calculate duration between defaultStartTime and defaultEndTime
      const durationHours = this.calculateDuration(rest.defaultStartTime, rest.defaultEndTime);
  
      // Determine shiftType based on duration
      let determinedShiftType: ShiftType;
      if (durationHours === 8) {
        determinedShiftType = ShiftType.STANDARD;
      } else if (durationHours === 12) {
        determinedShiftType = ShiftType.LONG;
      } else {
        throw new BadRequestException(
          'Shift duration must be exactly 8 or 12 hours to correspond with Standard or Long shift types.',
        );
      }
  
      // Optionally, set the name based on shiftType if not provided
      if (!rest.name) {
        rest.name = `${determinedShiftType} Shift`;
      }
  
      const shiftTemplate = this.shiftTemplateRepo.create({
        ...rest,
        shiftType: determinedShiftType,
        plant,
      });
      return this.shiftTemplateRepo.save(shiftTemplate);
    }
  
    /**
     * Retrieves all ShiftTemplates.
     * @returns An array of ShiftTemplate entities.
     */
    async getAllShiftTemplates(): Promise<ShiftTemplate[]> {
      return this.shiftTemplateRepo.find({ relations: ['plant'] });
    }
  
    /**
     * Retrieves ShiftTemplates by Plant ID.
     * @param plantId - The ID of the plant.
     * @returns An array of ShiftTemplate entities associated with the specified plant.
     */
    async getShiftTemplatesByPlantId(plantId: string): Promise<ShiftTemplate[]> {
      return this.shiftTemplateRepo.find({
        where: { plant: { plantId } },
        relations: ['plant'],
      });
    }
  
    /**
     * Retrieves a ShiftTemplate by its ID.
     * @param id - The ID of the ShiftTemplate.
     * @returns The ShiftTemplate entity.
     */
    async getShiftTemplateById(id: string): Promise<ShiftTemplate> {
      const shiftTemplate = await this.shiftTemplateRepo.findOne({
        where: { id },
        relations: ['plant'],
      });
      if (!shiftTemplate) {
        throw new NotFoundException(`Shift Template with ID ${id} not found`);
      }
      return shiftTemplate;
    }

    async getShiftTemplatesByType(type: ShiftType, plantId: string): Promise<ShiftTemplate[]> {
      
      return this.shiftTemplateRepo.find({ where: { shiftType: type, plant : {
        plantId
      } } });
    }
  
    /**
     * Updates an existing ShiftTemplate.
     * Recalculates shiftType if defaultStartTime or defaultEndTime are updated.
     * @param id - The ID of the ShiftTemplate to update.
     * @param data - Data transfer object containing updated shift template details.
     * @returns The updated ShiftTemplate entity.
     */
    async updateShiftTemplate(
      id: string,
      data: UpdateShiftTemplateDto,
    ): Promise<ShiftTemplate> {
      const shiftTemplate = await this.getShiftTemplateById(id);
  
      // If plantId is being updated, verify the new plant exists
      if (data.plantId) {
        const plant = await this.plantRepo.findOne({
          where: { plantId: data.plantId },
        });
        if (!plant) {
          throw new NotFoundException(`Plant with ID ${data.plantId} not found`);
        }
        shiftTemplate.plant = plant;
      }
  
      // If defaultStartTime or defaultEndTime are being updated, recalculate shiftType
      if (data.defaultStartTime || data.defaultEndTime) {
        const newStartTime = data.defaultStartTime || shiftTemplate.defaultStartTime;
        const newEndTime = data.defaultEndTime || shiftTemplate.defaultEndTime;
  
        const durationHours = this.calculateDuration(newStartTime, newEndTime);
  
        // Determine shiftType based on new duration
        if (durationHours === 8) {
          shiftTemplate.shiftType = ShiftType.STANDARD;
        } else if (durationHours === 12) {
          shiftTemplate.shiftType = ShiftType.LONG;
        } else {
          throw new BadRequestException(
            'Shift duration must be exactly 8 or 12 hours to correspond with Standard or Long shift types.',
          );
        }
  
        // Optionally, update the name based on new shiftType if not provided
        if (!data.name) {
          shiftTemplate.name = `${shiftTemplate.shiftType} Shift`;
        }
      }
  
      // Update other fields
      Object.assign(shiftTemplate, data);
      const updatedShiftTemplate = await this.shiftTemplateRepo.save(shiftTemplate);
      return updatedShiftTemplate;
    }
  
    /**
     * Deletes a ShiftTemplate by its ID.
     * @param id - The ID of the ShiftTemplate to delete.
     */
    async deleteShiftTemplate(id: string): Promise<{ message: string }> {
      const result = await this.shiftTemplateRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Shift Template with ID ${id} not found`);
      }
      return { message: `Shift Template with ID ${id} successfully deleted` };
    }
  
    /**
     * Calculates the duration in hours between two time strings.
     * Assumes both times are on the same day.
     * If endTime is earlier than or equal to startTime, it assumes the shift spans midnight.
     * @param startTime - Start time in 'HH:mm:ss' format.
     * @param endTime - End time in 'HH:mm:ss' format.
     * @returns Duration in hours.
     */
    private calculateDuration(startTime: string, endTime: string): number {
      const start = moment(startTime, 'HH:mm:ss');
      const end = moment(endTime, 'HH:mm:ss');
  
      if (!start.isValid() || !end.isValid()) {
        throw new BadRequestException('Invalid time format for startTime or endTime.');
      }
  
      let duration = moment.duration(end.diff(start)).asHours();
  
      // Handle shifts that span midnight
      if (duration <= 0) {
        duration += 24;
      }
  
      return duration;
    }
  
    /**
     * Retrieves ShiftTemplates that are available at the current time.
     * Optionally filters by shiftType and plantId.
     * @param currentTime - The current Date and Time. Defaults to now if not provided.
     * @param shiftType - (Optional) The type of shift to filter shift templates.
     * @param plantId - (Optional) The ID of the plant to filter shift templates.
     * @returns An array of available ShiftTemplate entities.
     */
    async findAvailableShiftTemplates(
      currentTime?: Date,
      shiftType?: ShiftType,
      plantId?: string,
    ): Promise<ShiftTemplate[]> {
      const now = currentTime ? moment(currentTime) : moment();
      const currentTimeStr = now.format('HH:mm:ss');
  
      // Base query with optional filters
      let query = this.shiftTemplateRepo.createQueryBuilder('shiftTemplate')
        .leftJoinAndSelect('shiftTemplate.plant', 'plant');
  
      // Apply optional plantId filter
      if (plantId) {
        query = query.where('plant.plantId = :plantId', { plantId });
      }
  
      // Apply optional shiftType filter
      if (shiftType) {
        query = query.andWhere('shiftTemplate.shiftType = :shiftType', { shiftType });
      }
  
      // Apply time-based filtering within SQL query
      query = query.andWhere(
        new Brackets(qb => {
          qb.where(
            `shiftTemplate.defaultEndTime > shiftTemplate.defaultStartTime 
             AND :currentTime >= shiftTemplate.defaultStartTime 
             AND :currentTime < shiftTemplate.defaultEndTime`,
            { currentTime: currentTimeStr }
          )
          .orWhere(
            `shiftTemplate.defaultEndTime <= shiftTemplate.defaultStartTime 
             AND (:currentTime >= shiftTemplate.defaultStartTime 
                  OR :currentTime < shiftTemplate.defaultEndTime)`,
            { currentTime: currentTimeStr }
          );
        })
      );
  
      // Execute the query to fetch available shift templates
      const availableShiftTemplates = await query.getMany();
  
      return availableShiftTemplates;
    }
  
    /**
     * Retrieves ShiftTemplates that are active at the current time.
     * Optionally filters by plantId and/or shiftType.
     * This method can be used as an alias or internally within the service.
     * @param currentTime - The current Date and Time. Defaults to now if not provided.
     * @param plantId - (Optional) The ID of the plant to filter shift templates.
     * @param shiftType - (Optional) The type of shift to filter shift templates.
     * @returns An array of active ShiftTemplate entities.
     */
    async getShiftTemplatesByCurrentTime(
      currentTime?: Date,
      plantId?: string,
      shiftType?: ShiftType,
    ): Promise<ShiftTemplate[]> {
      // This method can internally call findAvailableShiftTemplates
      return this.findAvailableShiftTemplates(currentTime, shiftType, plantId);
    }
  }
