import { Module } from '@nestjs/common';
import { ShiftScheduleModule } from './shift-schedule/shift-schedule.module';
import { ShiftPostingModule } from './shift-posting/shift-posting.module';
import { ShiftEndModule } from './shift-end/shift-end.module';

@Module({
  imports: [ShiftScheduleModule, ShiftPostingModule, ShiftEndModule],
})
export class ShiftModule {}
