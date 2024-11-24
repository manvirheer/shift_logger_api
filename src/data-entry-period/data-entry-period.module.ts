// src/data-entry-period/data-entry-period.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataEntryPeriod } from './entities/data-entry-period.entity';
import { DataEntryPeriodService } from './data-entry-period.service';
import { DataEntryPeriodController } from './data-entry-period.controller';
import { Plant } from '../plant/entities/plant.entity';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DataEntryPeriod, Plant]),
    PassportModule,
    UserModule,
  ],
  controllers: [DataEntryPeriodController],
  providers: [DataEntryPeriodService],
  exports: [DataEntryPeriodService],  
})
export class DataEntryPeriodModule {}