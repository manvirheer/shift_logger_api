// steam-generation.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SteamGenerationService } from './steam-generation.service';
import { SteamGenerationController } from './steam-generation.controller';
import { SteamGenerationRecord } from './entities/steam-generation-record.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { ShiftScheduleModule } from '../../shift/shift-schedule/shift-schedule.module';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SteamGenerationRecord, User, Plant]), // Existing repositories
    ShiftScheduleModule,
    UserModule,
    PlantModule,
  ],
  providers: [SteamGenerationService],
  controllers: [SteamGenerationController],
})
export class SteamGenerationModule {}
