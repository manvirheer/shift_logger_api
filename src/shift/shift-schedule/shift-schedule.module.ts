// shift-schedule.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftScheduleService } from './shift-schedule.service';
import { ShiftScheduleController } from './shift-schedule.controller';
import { ShiftSchedule } from './entities/shift-schedule.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { PlantModule } from '../../plant/plant.module';
import { User } from '../../user/entities/user.entity';
import { UserModule } from '../../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShiftSchedule, Plant, User]),
    PlantModule,
    UserModule,
  ],
  controllers: [ShiftScheduleController],
  providers: [ShiftScheduleService],
  exports: [ShiftScheduleService, TypeOrmModule], // Ensure TypeOrmModule is exported
})
export class ShiftScheduleModule {}
