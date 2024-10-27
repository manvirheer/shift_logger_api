import { Module } from '@nestjs/common';
import { ShiftScheduleModule } from './shift-schedule/shift-schedule.module';
import { ShiftPostingModule } from './shift-posting/shift-posting.module';

@Module({
  imports: [ShiftScheduleModule, ShiftPostingModule],
})
export class ShiftModule {}
