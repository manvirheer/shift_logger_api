// src/data-entry-period/data-entry-period.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { DataEntryPeriodService } from './data-entry-period.service';
import { CreateDataEntryPeriodDto } from './dtos/create-data-entry-period.dto';
import { UpdateDataEntryPeriodDto } from './dtos/update-data-entry-period.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('data-entry-periods')
export class DataEntryPeriodController {
  constructor(private readonly dataEntryPeriodService: DataEntryPeriodService) {}

  @Get()
  async findAll() {
    return this.dataEntryPeriodService.findAll();
  }

  @Get('plant/:plantId')
  async findByPlant(@Param('plantId') plantId: string) {
    return this.dataEntryPeriodService.findByPlant(plantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dataEntryPeriodService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateDataEntryPeriodDto) {
    return this.dataEntryPeriodService.create(createDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDataEntryPeriodDto,
  ) {
    return this.dataEntryPeriodService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.dataEntryPeriodService.remove(id);
    return { message: 'Data entry period deleted successfully' };
  }

  @Get('plant/:plantId/coverage')
  async checkCoverage(@Param('plantId') plantId: string) {
    const isComplete = await this.dataEntryPeriodService.validatePeriodCoverage(
      plantId,
    );
    return { complete: isComplete };
  }

  @Get('plant/:plantId/current-period')
  async getCurrentPeriod(@Param('plantId') plantId: string) {
    const currentData = await this.dataEntryPeriodService.findPeriodForTime(
      plantId,
      new Date(),
    );
    if (currentData) {
      return {
        entryPeriod: currentData.entryPeriod,
        entryDate: currentData.entryDate,
      };
    } else {
      return { message: 'No current period found for the specified plant.' };
    }
  }
}
