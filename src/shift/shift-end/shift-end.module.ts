import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftEndService } from './shift-end.service';
import { ShiftEndController } from './shift-end.controller';
import { ShiftEndEntry } from './entities/shift-end-entry.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { AshService } from 'src/record/ash/ash.service';
import { Ash } from 'src/record/ash/entities/ash.entity';
import { InventoryRecord } from 'src/record/inventory/entities/inventory-record.entity';
import { InventoryService } from 'src/record/inventory/inventory.service';
import { SteamGenerationRecord } from 'src/record/steam-generation/entities/steam-generation-record.entity';
import { SteamGenerationService } from 'src/record/steam-generation/steam-generation.service';
import { User } from 'src/user/entities/user.entity';
import { ShiftSchedule } from '../shift-schedule/entities/shift-schedule.entity';
import { DataEntryPeriod } from 'src/data-entry-period/entities/data-entry-period.entity';
import { DataEntryPeriodService } from 'src/data-entry-period/data-entry-period.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftEndEntry,
      ShiftSchedule,
      SteamGenerationRecord,
      InventoryRecord,
      Ash,
      User,
      Plant,
      DataEntryPeriod
    ]),
  ],
  providers: [
    ShiftEndService,
    SteamGenerationService,
    InventoryService,
    AshService,
    DataEntryPeriodService
  ],
  controllers: [ShiftEndController],
})
export class ShiftEndModule {}
