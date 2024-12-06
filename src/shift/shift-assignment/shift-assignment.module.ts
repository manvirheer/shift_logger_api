import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftAssignmentService } from './shift-assignment.service';
import { ShiftAssignmentController } from './shift-assignment.controller';
import { ShiftAssignment } from './entities/shift-assignment.entity';
import { ShiftSchedule } from '../shift-schedule/entities/shift-schedule.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftAssignment, ShiftSchedule, User, Plant])],
  controllers: [ShiftAssignmentController],
  providers: [ShiftAssignmentService],
  exports: [ShiftAssignmentService, TypeOrmModule],
})
export class ShiftAssignmentModule {}
