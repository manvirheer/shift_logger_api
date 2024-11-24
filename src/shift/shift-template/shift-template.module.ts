import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftTemplateService } from './shift-template.service';
import { ShiftTemplateController } from './shift-template.controller';
import { ShiftTemplate } from './entities/shift-template.entity';
import { Plant } from 'src/plant/entities/plant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShiftTemplate, Plant])],
  controllers: [ShiftTemplateController],
  providers: [ShiftTemplateService],
  exports: [ShiftTemplateService],
})
export class ShiftTemplateModule {}
