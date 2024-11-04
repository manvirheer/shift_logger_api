import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryRecordDto } from './dtos/create-inventory.dto';
import { UpdateInventoryRecordDto } from './dtos/update-inventory.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async create(
    @Body() createDto: CreateInventoryRecordDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.inventoryService.create(createDto, userId);
  }

  @Get()
  async findAll(
    @Query('plantId') plantId?: string,
    @Query('shiftScheduleId') shiftScheduleId?: string,
    // Add other query parameters as needed
  ) {
    return this.inventoryService.findAll({ plantId, shiftScheduleId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryRecordDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.inventoryService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.inventoryService.remove(id);
    return { message: 'Inventory record deleted successfully' };
  }
}
