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

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityRecord, User, Plant, ShiftSchedule]),
    UserModule,
    PlantModule,
    ShiftSchedule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
