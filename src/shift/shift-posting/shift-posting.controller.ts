import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { ShiftPostingService } from './shift-posting.service';
  import { CreateShiftPostingDto } from './dtos/create-shift-posting.dto';
  import { UpdateShiftPostingDto } from './dtos/update-shift-posting.dto';
  import { AuthGuard } from '@nestjs/passport';
  
  @UseGuards(AuthGuard('jwt'))
  @Controller('shift/postings')
  export class ShiftPostingController {
    constructor(private readonly shiftPostingService: ShiftPostingService) {}
  
    @Post()
    async createShiftPosting(
      @Body() createDto: CreateShiftPostingDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.shiftPostingService.createShiftPosting(createDto, userId);
    }
  
    @Get()
    async getAllShiftPostings() {
      return this.shiftPostingService.getAllShiftPostings();
    }

    @Get('/plants/:id')
    async getShiftPostingsByPlantId(@Param('id') id: string) {
      return this.shiftPostingService.getShiftPostingsByPlantId(id);
    }
  
    @Patch(':id')
    async updateShiftPosting(
      @Param('id') id: string,
      @Body() updateDto: UpdateShiftPostingDto,
      @Request() req,
    ) {
      const userId = req.user.id;
      return this.shiftPostingService.updateShiftPosting(id, updateDto, userId);
    }
  
    @Delete(':id')
    async deleteShiftPosting(@Param('id') id: string) {
      await this.shiftPostingService.deleteShiftPosting(id);
      return { message: 'Shift Posting deleted successfully' };
    }

    // delete all the shift postings
    @Delete()
    async deleteAllShiftPostings() {
      await this.shiftPostingService.deleteAllShiftPostings();
      return { message: 'All Shift Postings deleted successfully' };
    }
    
  }
  