import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteamParametersService } from './steam-parameters.service';
import { SteamParametersController } from './steam-parameters.controller';
import { SteamParameters } from './entities/steam-parameters.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';
import { ShiftScheduleModule } from '../../shift/shift-schedule/shift-schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SteamParameters,
      User,
      Plant,
      ShiftSchedule,
    ]),
    UserModule,
    PlantModule,
    ShiftScheduleModule,
  ],
  controllers: [SteamParametersController],
  providers: [SteamParametersService],
  exports: [SteamParametersService],
})
export class SteamParametersModule {}
