import { Module } from '@nestjs/common';
import { ShiftScheduleModule } from './shift-schedule/shift-schedule.module';
import { ShiftAssignmentModule } from './shift-assignment/shift-assignment.module';
import { ShiftEndModule } from './shift-end/shift-end.module';
import { ShiftTemplateModule } from './shift-template/shift-template.module';

@Module({
  imports: [ShiftScheduleModule, ShiftAssignmentModule, ShiftEndModule, ShiftTemplateModule],
})
export class ShiftModule {}
