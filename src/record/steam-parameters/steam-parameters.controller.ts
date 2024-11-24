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
    BadRequestException,
  } from '@nestjs/common';
  import { SteamParametersService } from './steam-parameters.service';
  import { CreateSteamParametersDto } from './dtos/create-steam-parameters.dto';
  import { UpdateSteamParametersDto } from './dtos/update-steam-parameters.dto';
  import { AuthGuard } from '@nestjs/passport';
import { BulkUpdateSteamParametersDto } from './dtos/bulk-update-steam-parameters.dto';
  
  @UseGuards(AuthGuard('jwt'))
  @Controller('record/steam-parameters')
  export class SteamParametersController {
    constructor(
      private readonly steamParametersService: SteamParametersService,
    ) {}
  
    @Post()
    async create(
      @Body() createDto: CreateSteamParametersDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.steamParametersService.create(createDto, userId);
    }
  
    @Get()
    async findAll(
      @Query('shiftScheduleId') shiftScheduleId?: string,
      @Query('plantId') plantId?: string,
      @Query('createdById') createdById?: string,
    ) {
      return this.steamParametersService.findAll({
        shiftScheduleId,
        plantId,
        createdById,
      });
    }

    
    @Get('date/:date')
    async findByDate(@Param('date') date: string) {

      if (!date) {
        throw new BadRequestException('Date query parameter is required');
      }
  
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        throw new BadRequestException('Date must be in YYYY-MM-DD format');
      }
  
      return this.steamParametersService.findByDate(date);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return await this.steamParametersService.findOne(id);
    }

    
    @Patch('bulk-update')
    async bulkUpdate(
      @Body() bulkUpdateDto: BulkUpdateSteamParametersDto,
      @Request() req,
    ): Promise<{ message: string }> {
      const userId = req.user.id;
      await this.steamParametersService.bulkUpdate(bulkUpdateDto.updates, userId);
      return { message: 'Bulk update successful' };
    } 
  
    @Patch(':id')
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdateSteamParametersDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.steamParametersService.update(id, updateDto, userId);
    }

  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.steamParametersService.remove(id);
      return { message: 'Steam Parameters record deleted successfully' };
    }
  }
  