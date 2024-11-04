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
import { SteamGenerationService } from './steam-generation.service';
import { CreateSteamGenerationDto } from './dtos/create-steam-generation.dto';
import { UpdateSteamGenerationDto } from './dtos/update-steam-generation.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('record/steam-generation')
export class SteamGenerationController {
  constructor(private readonly steamGenService: SteamGenerationService) {}

  @Post()
  async create(
    @Body() createDto: CreateSteamGenerationDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.steamGenService.create(createDto, userId);
  }

  @Get()
  async findAll() {
    return this.steamGenService.findAll();
  }

  @Delete()
  async deleteAll() {
    await this.steamGenService.deleteAll();
    return { message: 'All records deleted successfully' };
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.steamGenService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSteamGenerationDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.steamGenService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.steamGenService.remove(id);
    return { message: 'Record deleted successfully' };
  }

  // get records by shift schedule id
  @Get('shift-schedule/:id')
  async getRecordsByShiftScheduleId(@Param('id') id: string) {
    return this.steamGenService.findByShiftScheduleId(id);
  }
}
