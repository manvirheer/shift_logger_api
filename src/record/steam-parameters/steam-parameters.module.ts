import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteamParametersService } from './steam-parameters.service';
import { SteamParametersController } from './steam-parameters.controller';
import { SteamParameters } from './entities/steam-parameters.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';
import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriod } from 'src/data-entry-period/entities/data-entry-period.entity';
import { DataEntryPeriodModule } from 'src/data-entry-period/data-entry-period.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SteamParameters,
      User,
      Plant,
      ShiftSchedule
    ]),
    UserModule,
    PlantModule,
    DataEntryPeriodModule,
  ],
  controllers: [SteamParametersController],
  providers: [SteamParametersService],
  exports: [SteamParametersService],
})
export class SteamParametersModule {}
