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
  import { SteamGenerationService } from './steam-generation.service';
  import { CreateSteamGenerationDto } from './dtos/create-steam-generation.dto';
  import { UpdateSteamGenerationDto } from './dtos/update-steam-generation.dto';
  
  @Controller('record/steam-generation')
  export class SteamGenerationController {
    constructor(private readonly steamGenService: SteamGenerationService) {}
  
    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async create(@Body() createDto: CreateSteamGenerationDto) {
      return this.steamGenService.create(createDto);
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
  