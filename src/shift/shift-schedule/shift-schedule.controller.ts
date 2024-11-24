import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ShiftScheduleService } from './shift-schedule.service';
import { CreateShiftScheduleDto } from './dtos/create-shift-schedule.dto';
import { UpdateShiftScheduleDto } from './dtos/update-shift-schedule.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shift/schedules')
export class ShiftScheduleController {
  constructor(private readonly shiftScheduleService: ShiftScheduleService) { }

  @Post()
  async createShiftSchedule(
    @Body() createDto: CreateShiftScheduleDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.shiftScheduleService.createShiftSchedule(createDto, userId);
  }

  @Post('staff-assign/:shiftTemplateId')
  async assignStaffToShiftSchedule(@Param('shiftTemplateId') shiftTemplateId: string,
    @Request() req,
  ) {
    console.log('shiftTemplateId', shiftTemplateId);
    const userId = req.user.id;
    return await this.shiftScheduleService.assignShiftToUser(userId, shiftTemplateId);
  }

  @Get()
  async getAllShiftSchedules(
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('plantId') plantId?: string,
    @Query('shiftTitle') shiftTitle?: string,
  ) {
    return await this.shiftScheduleService.getAllShiftSchedules(
      startTime,
      endTime,
      plantId,
      shiftTitle,
    );
  }

  @Get('staff-login')
  async getStaffLoginShiftSchedule(@Request() req) {
    const userId = req.user.id;
    return await this.shiftScheduleService.handleUserShiftAssignment(userId);
  }

  @Get(':id')
  async getShiftScheduleById(@Param('id') id: string) {
    return this.shiftScheduleService.getShiftScheduleById(id);
  }

  @Get('current/:plantId')
  async getCurrentShiftAssignments(@Param('plantId') plantId: string) {
    const shiftSchedule = await this.shiftScheduleService.getCurrentShiftAssignments(
      plantId,
    );
    if (!shiftSchedule) {
      return { message: 'No current shift schedule found' };
    }
    return shiftSchedule;
  }

  @Patch(':id')
  async updateShiftSchedule(
    @Param('id') id: string,
    @Body() updateDto: UpdateShiftScheduleDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.shiftScheduleService.updateShiftSchedule(id, updateDto, userId);
  }

  @Delete(':id')
  async deleteShiftSchedule(@Param('id') id: string) {
    await this.shiftScheduleService.deleteShiftSchedule(id);
    return { message: 'Shift Schedule deleted successfully' };
  }


}
