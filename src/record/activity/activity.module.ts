import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRecord } from './entities/activity-record.entity';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';
import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriod } from 'src/data-entry-period/entities/data-entry-period.entity';
import { DataEntryPeriodModule } from 'src/data-entry-period/data-entry-period.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityRecord, User, Plant, ShiftSchedule]),
    UserModule,
    PlantModule,
    ShiftSchedule,
    DataEntryPeriodModule
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
