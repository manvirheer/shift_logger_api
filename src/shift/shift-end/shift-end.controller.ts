import { Controller, Post, Body, Request, UseGuards, Get, Delete, Patch } from '@nestjs/common';
import { ShiftEndService } from './shift-end.service';
import { ShiftEndEntryDto } from './dtos/shift-end-entry.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateShiftEndEntryDto } from './dtos/update-shift-end-entry.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('shift/end-entry')
export class ShiftEndController {
  constructor(private readonly shiftEndService: ShiftEndService) { }

  @Post()
  async createShiftEndEntry(@Body() data: ShiftEndEntryDto, @Request() req) {
    const userId = req.user.id;
    return this.shiftEndService.handleShiftEndEntry(data, userId);
  }

  @Get()
  async getShiftEndEntries() {
    return this.shiftEndService.getShiftEndEntries();
  }

  @Get('check/:shiftScheduleId')
  async checkIfShiftEndEntryExists(@Request() req) {
    const shiftScheduleId = req.params.shiftScheduleId;
    return this.shiftEndService.checkIfShiftEndEntryExists(shiftScheduleId);
  }


  @Patch()
  async updateShiftEndEntry(@Body() data: UpdateShiftEndEntryDto, @Request() req) {
    const userId = req.user.id;
    return this.shiftEndService.update(data, userId);
  }
}
