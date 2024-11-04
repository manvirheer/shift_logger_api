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
  import { AshService } from './ash.service';
  import { CreateAshDto } from './dtos/create-ash.dto';
  import { UpdateAshDto } from './dtos/update-ash.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @UseGuards(AuthGuard('jwt'))
  @Controller('ash')
  export class AshController {
    constructor(private readonly ashGenService: AshService) {}
  
    @Post()
    async create(@Body() createDto: CreateAshDto, @Request() req) {
      const userId = req.user.id;
      return this.ashGenService.create(createDto, userId);
    }
  
    @Get()
    async findAll(
      @Query('shiftScheduleId') shiftScheduleId?: string,
      @Query('plantId') plantId?: string,
      @Query('createdById') createdById?: string,
    ) {
      return this.ashGenService.findAll({ shiftScheduleId, plantId, createdById });
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.ashGenService.findOne(id);
    }
  
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateAshDto, @Request() req) {
      const userId = req.user.id;
      return this.ashGenService.update(id, updateDto, userId);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.ashGenService.remove(id);
      return { message: 'Ash Generation record deleted successfully' };
    }
  }
  