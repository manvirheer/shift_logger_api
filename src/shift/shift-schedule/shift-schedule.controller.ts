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
    constructor(private readonly shiftScheduleService: ShiftScheduleService) {}
  
    @Post()
    async createShiftSchedule(
      @Body() createDto: CreateShiftScheduleDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return await this.shiftScheduleService.createShiftSchedule(createDto, userId);
    }
  
    @Get()
    async getAllShiftSchedules(@Query('date') date?: string, @Query('plantId') plantId?: string, @Query('shiftTitle') shiftTitle?: string) {
      return await this.shiftScheduleService.getAllShiftSchedules(date, plantId, shiftTitle);
    }


    // get active shifts
    @Get('active')
    async getActiveShifts() {
      return await this.shiftScheduleService.getActiveShiftSchedules();
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

    // delete all the shift schedules
    @Delete()
    async deleteAllShiftSchedules() {
      await this.shiftScheduleService.deleteAllShiftSchedules();
      return { message: 'All Shift Schedules deleted successfully' };
    }
  }
  