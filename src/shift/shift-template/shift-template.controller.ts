// src/shift/shift-template/shift-template.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ShiftTemplateService } from './shift-template.service';
import { ShiftTemplate, ShiftType } from './entities/shift-template.entity';
import { CreateShiftTemplateDto } from './dtos/create-shift-template.dto';
import { UpdateShiftTemplateDto } from './dtos/update-shift-template.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shift/templates')
export class ShiftTemplateController {
  constructor(private readonly shiftTemplateService: ShiftTemplateService) { }

  /**
   * Endpoint to create a new shift template.
   * 
   * Example Request:
   * - POST /shift-templates
   * 
   * Body:
   * {
   *   "plantId": "123e4567-e89b-12d3-a456-426614174000",
   *   "name": "Morning Shift",
   *   "defaultStartTime": "06:00:00",
   *   "defaultEndTime": "14:00:00",
   *   "description": "Standard morning shift"
   * }
   */
  @Post()
  async createShiftTemplate(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createShiftTemplateDto: CreateShiftTemplateDto,
  ): Promise<ShiftTemplate> {
    return this.shiftTemplateService.createShiftTemplate(createShiftTemplateDto);
  }

  /**
   * Endpoint to retrieve all shift templates.
   * 
   * Example Request:
   * - GET /shift-templates
   */
  @Get()
  async getAllShiftTemplates(): Promise<ShiftTemplate[]> {
    console.log("Getting all shift templates");
    return this.shiftTemplateService.getAllShiftTemplates();
  }

  /**
   * Endpoint to retrieve active shift templates based on current time.
   * Optionally filters by plantId and shiftType.
   * 
   * Example Requests:
   * - GET /shift-templates/active
   * - GET /shift-templates/active?plantId=123e4567-e89b-12d3-a456-426614174000
   * - GET /shift-templates/active?shiftType=Standard
   * - GET /shift-templates/active?plantId=123e4567-e89b-12d3-a456-426614174000&shiftType=Long
   */
  @Get('active')
  async getActiveShiftTemplates(
    @Query('currentTime') currentTime?: string, // Optional: ISO string
    // Optional query parameters
    @Query('plantId') plantId?: string,
    @Query('shiftType') shiftType?: ShiftType,
  ): Promise<ShiftTemplate[]> {
    const parsedCurrentTime = currentTime ? new Date(currentTime) : undefined;
    console.log("Received currentTime: ", parsedCurrentTime);
    console.log("Received plantId: ", plantId);
    console.log("Received shiftType: ", shiftType);
    return this.shiftTemplateService.findAvailableShiftTemplates(
      parsedCurrentTime,
      shiftType,
      plantId,
    );
  }

  @Get('type/:type')
  async getShiftTemplatesByType(
    @Param('type') type: ShiftType,
    @Query('plantId') plantId?: string,
  ): Promise<ShiftTemplate[]> {

    return this.shiftTemplateService.getShiftTemplatesByType(type, plantId);
  }

  /**
   * Endpoint to retrieve a shift template by its ID.
   * 
   * Example Request:
   * - GET /shift-templates/123e4567-e89b-12d3-a456-426614174000
   */
  @Get(':id')
  async getShiftTemplateById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ShiftTemplate> {
    console.log("Getting shift template by ID: ", id);
    return this.shiftTemplateService.getShiftTemplateById(id);
  }

  /**
   * Endpoint to update an existing shift template.
   * 
   * Example Request:
   * - PATCH /shift-templates/123e4567-e89b-12d3-a456-426614174000
   * 
   * Body:
   * {
   *   "name": "Evening Shift",
   *   "defaultStartTime": "14:00:00",
   *   "defaultEndTime": "22:00:00",
   *   "description": "Updated evening shift"
   * }
   */
  @Patch(':id')
  async updateShiftTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateShiftTemplateDto: UpdateShiftTemplateDto,
  ): Promise<ShiftTemplate> {
    return this.shiftTemplateService.updateShiftTemplate(id, updateShiftTemplateDto);
  }

  /**
   * Endpoint to delete a shift template by its ID.
   * 
   * Example Request:
   * - DELETE /shift-templates/123e4567-e89b-12d3-a456-426614174000
   */
  @Delete(':id')
  async deleteShiftTemplate(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.shiftTemplateService.deleteShiftTemplate(id);
  }
}
