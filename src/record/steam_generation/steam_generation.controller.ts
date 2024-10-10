import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { SteamGenerationRecordService } from './steam_generation.service';
  import { CreateSteamGenerationDto } from './dtos/create_steam_generation.dto';    
  import { UpdateSteamGenerationDto } from './dtos/update_steam_generation.dto';
  
  @Controller('records/steam_generation')
  export class SteamGenerationRecordController {
    constructor(
      private readonly steamGenService: SteamGenerationRecordService,
    ) {}
  
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() createDto: CreateSteamGenerationDto) {
      const record = await this.steamGenService.create(createDto);
      return record;
    }
  
    @Get()
    async findAll() {
      return this.steamGenService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      return this.steamGenService.findOne(id);
    }
  
    @Patch(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async update(
      @Param('id') id: string,
      @Body() updateDto: UpdateSteamGenerationDto,
    ) {
      return this.steamGenService.update(id, updateDto);
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      await this.steamGenService.remove(id);
      return { message: 'Record deleted successfully' };
    }
  }