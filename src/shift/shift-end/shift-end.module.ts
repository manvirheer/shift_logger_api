// app/shift-end-entry/shift-end-entry.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftEndService } from './shift-end.service';
import { ShiftEndController } from './shift-end.controller';
import { ShiftSchedule } from '../../shift/shift-schedule/entities/shift-schedule.entity';
import { SteamGenerationService } from '../../record/steam-generation/steam-generation.service';
import { SteamGenerationRecord } from 'src/record/steam-generation/entities/steam-generation-record.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from 'src/plant/entities/plant.entity';
import { Ash } from 'src/record/ash/entities/ash.entity';
import { InventoryRecord } from 'src/record/inventory/entities/inventory-record.entity';
import { AshService } from 'src/record/ash/ash.service';
import { In } from 'typeorm';
import { InventoryService } from 'src/record/inventory/inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftSchedule, SteamGenerationRecord, User, Plant, Ash, InventoryRecord])],
  providers: [ShiftEndService, SteamGenerationService, AshService, InventoryService],
  controllers: [ShiftEndController],
})
export class ShiftEndModule {}
