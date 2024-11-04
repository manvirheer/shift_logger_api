import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dtos/create-plant.dto';
import { UpdatePlantDto } from './dtos/update-plant.dto';
import { UsersIdsDto } from './dtos/users-ids.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/guards/roles.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async createPlant(@Body() createPlantDto: CreatePlantDto) {
    const plant = await this.plantService.createPlant(createPlantDto);
    return plant;
  }

  @Get()
  async getAllPlants() {
    const plants = await this.plantService.findAllPlants();
    return plants;
  }

  @Get('staff/:staffId')
  async getPlantIdByStaffId(@Param('staffId') staffId: string) {
    const plantId = await this.plantService.getPlantIdByStaffId(staffId);
    return { plantId };
  }

  @Get(':plantId')
  async getPlantById(@Param('plantId') plantId: string) {
    const plant = await this.plantService.findPlantById(plantId); 
    return plant;
  }

  @Roles(UserRole.ADMIN)
  @Patch(':plantId')  
  async updatePlant(
    @Param('plantId') plantId: string, 
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantService.updatePlant(plantId, updatePlantDto);  
  }

  @Roles(UserRole.ADMIN)
  @Delete(':plantId')  
  async deletePlant(@Param('plantId') plantId: string) {
    // remove all users from the plant to remove foreign key constraint
    await this.plantService.removeAllUsersFromPlant(plantId);
    await this.plantService.removePlant(plantId); 
    return { message: 'Plant deleted successfully' };
  }

  @Roles(UserRole.ADMIN)
  @Post(':plantId/users')  
  async addUsersToPlant(
    @Param('plantId') plantId: string,  
    @Body() addUsersToPlantDto: UsersIdsDto,
  ) {
    return this.plantService.addUsersToPlant(plantId, addUsersToPlantDto.userIds); 
  }

  @Roles(UserRole.ADMIN)
  @Delete(':plantId/users')  
  async removeUsersFromPlant(
    @Param('plantId') plantId: string, 
    @Body() removeUsersDto: UsersIdsDto,
  ) {
    return this.plantService.removeUsersFromPlant(plantId, removeUsersDto.userIds); 
  }

  // remove all users from plant
  @Roles(UserRole.ADMIN)
  @Delete(':plantId/users/all')
  async removeAllUsersFromPlant(@Param('plantId') plantId: string) {
    return this.plantService.removeAllUsersFromPlant(plantId);
  }


}
