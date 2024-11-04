// src/record/shipment/shipment.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { Shipment } from './entities/shipment.entity';
import { User } from '../../user/entities/user.entity';
import { Plant } from '../../plant/entities/plant.entity';
import { ShiftSchedule } from 'src/shift/shift-schedule/entities/shift-schedule.entity';
import { InventoryRecord } from '../inventory/entities/inventory-record.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from '../../plant/plant.module';
import { ShiftScheduleModule } from '../../shift/shift-schedule/shift-schedule.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, User, Plant, ShiftSchedule, InventoryRecord]),
    UserModule,
    PlantModule,
    ShiftScheduleModule,
    InventoryModule, 
  ],
  providers: [ShipmentService],
  controllers: [ShipmentController],
})
export class ShipmentModule {}
