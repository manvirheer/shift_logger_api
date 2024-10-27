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
  } from '@nestjs/common';
  import { InventoryService } from './inventory.service';
  import { CreateInventoryDto } from './dtos/create-inventory.dto';
  import { UpdateInventoryDto } from './dtos/update-inventory.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @UseGuards(AuthGuard('jwt'))
  @Controller('record/inventory')
  export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}
  
    @Post()
    async create(
      @Body() createDto: CreateInventoryDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.inventoryService.create(createDto, userId);
    }
  
    @Get()
    async findAll() {
      return this.inventoryService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.inventoryService.findOne(id);
    }
  
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdateInventoryDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.inventoryService.update(id, updateDto, userId);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.inventoryService.remove(id);
      return { message: 'Record deleted successfully' };
    }
  }
  