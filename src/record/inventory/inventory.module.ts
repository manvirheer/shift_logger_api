import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryRecord } from './entities/inventory-record.entity';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { User } from '../../user/entities/user.entity';
import { UserModule } from '../../user/user.module';
import { PlantModule } from 'src/plant/plant.module';
import { Plant } from 'src/plant/entities/plant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryRecord, User, Plant]),
    UserModule, PlantModule
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
