import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AshService } from './ash.service';
import { AshController } from './ash.controller';
import { Ash} from './entities/ash.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';
import { ShiftScheduleModule } from '../../shift/shift-schedule/shift-schedule.module';
import { DataEntryPeriodModule } from 'src/data-entry-period/data-entry-period.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ash, User, Plant, ShiftSchedule]),
    UserModule,
    PlantModule,
    ShiftScheduleModule,
    DataEntryPeriodModule,
  ],
  controllers: [AshController],
  providers: [AshService],
  exports: [AshService],
})
export class AshModule {}
