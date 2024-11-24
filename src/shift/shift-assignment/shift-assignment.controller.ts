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
} from '@nestjs/common';
import { ShiftAssignmentService } from './shift-assignment.service';
import { CreateShiftAssignmentDto } from './dtos/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dtos/update-shift-assignment.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('shift/assignments')
export class ShiftAssignmentController {
  constructor(private readonly shiftAssignmentService: ShiftAssignmentService) {}

  @Post()
  async createShiftAssignment(
    @Body() createDto: CreateShiftAssignmentDto,
    @Request() req,
  ) {
    const assignedById = req.user.id;
    return this.shiftAssignmentService.createShiftAssignment(createDto, assignedById);
  }

  @Get()
  async getAllShiftAssignments() {
    return this.shiftAssignmentService.getAllShiftAssignments();
  }

  @Get('schedule/:shiftScheduleId')
  async getShiftAssignmentsByShiftScheduleId(@Param('shiftScheduleId') shiftScheduleId: string) {
    return this.shiftAssignmentService.getShiftAssignmentsByShiftScheduleId(shiftScheduleId);
  }

  @Get('user/:userId')
  async getShiftAssignmentsByUserId(@Param('userId') userId: string) {
    return this.shiftAssignmentService.getShiftAssignmentsByUserId(userId);
  }

  @Patch(':id')
  async updateShiftAssignment(
    @Param('id') id: string,
    @Body() updateDto: UpdateShiftAssignmentDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.shiftAssignmentService.updateShiftAssignment(id, updateDto, userId);
  }

  @Delete(':id')
  async deleteShiftAssignment(@Param('id') id: string) {
    await this.shiftAssignmentService.deleteShiftAssignment(id);
    return { message: 'Shift Assignment deleted successfully' };
  }
}
