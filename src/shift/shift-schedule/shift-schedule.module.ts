import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftScheduleService } from './shift-schedule.service';
import { ShiftScheduleController } from './shift-schedule.controller';
import { ShiftSchedule } from './entities/shift-schedule.entity';
import { ShiftTemplate } from '../shift-template/entities/shift-template.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { User } from '../../user/entities/user.entity';
import { ShiftAssignment } from '../shift-assignment/entities/shift-assignment.entity';
import { ShiftAssignmentModule } from '../shift-assignment/shift-assignment.module';
import { ShiftTemplateModule } from '../shift-template/shift-template.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftSchedule, ShiftTemplate, Plant, User, ShiftTemplate, ShiftAssignment]),
    ShiftAssignmentModule,
    ShiftTemplateModule,
  ],
  controllers: [ShiftScheduleController],
  providers: [ShiftScheduleService],
  exports: [ShiftScheduleService, TypeOrmModule],
})
export class ShiftScheduleModule {}
