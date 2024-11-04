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
  import { SteamParametersService } from './steam-parameters.service';
  import { CreateSteamParametersDto } from './dtos/create-steam-parameters.dto';
  import { UpdateSteamParametersDto } from './dtos/update-steam-parameters.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @UseGuards(AuthGuard('jwt'))
  @Controller('steam-parameters')
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
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.steamParametersService.findOne(id);
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
  