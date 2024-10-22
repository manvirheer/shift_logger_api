import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm/index';
import { Plant } from './entities/plant.entity';
import { CreatePlantDto } from './dtos/create-plant.dto';
import { UpdatePlantDto } from './dtos/update-plant.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PlantService {
  constructor(
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createPlant(createPlantDto: CreatePlantDto): Promise<Plant> {
    const plant = this.plantRepo.create(createPlantDto);
    return this.plantRepo.save(plant);
  }

  async findAllPlants(): Promise<Plant[]> {
    return this.plantRepo.find({ relations: ['users'] });
  }

  async findPlantById(plantId: string): Promise<Plant> {
    const plant = await this.plantRepo.findOne({
      where: { plantId },
      relations: ['users'],
    });
    if (!plant) {
      throw new NotFoundException('Plant not found');
    }
    return plant;
  }

  async updatePlant(plantId: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.findPlantById(plantId);
    Object.assign(plant, updatePlantDto);
    return this.plantRepo.save(plant);
  }

  async removePlant(plantId: string): Promise<void> {
    const plant = await this.findPlantById(plantId);
    await this.plantRepo.remove(plant);
  }

  async addUsersToPlant(
    plantId: string,
    userIds: string[],
  ): Promise<Plant> {
    const plant = await this.findPlantById(plantId);

    // Find users by IDs using find by and in
    const usersToAdd = await this.userRepo.findBy({ id: In(userIds) });
    if (usersToAdd.length !== userIds.length) {
      throw new NotFoundException('One or more users not found');
    }
  
    // Get IDs of users already associated with the plant
    const existingUserIds = new Set(plant.users.map(user => user.id));
  
    // Filter out users who are already associated with the plant
    const newUsers = usersToAdd.filter(user => !existingUserIds.has(user.id));
  
    // Add only new users
    plant.users = [...plant.users, ...newUsers];
  
    // Save the plant
    await this.plantRepo.save(plant);
  
    // Reload the plant with necessary relations
    const updatedPlant = await this.plantRepo.findOne({
      where: { plantId: plantId },
      relations: ['users', 'users.staff', 'users.admin'],
    });
  
    if (!updatedPlant) {
      throw new NotFoundException('Plant not found after update');
    }
  
    return updatedPlant;
  }
  

  async removeUsersFromPlant(
    plantId: string,
    userIds: string[],
  ): Promise<Plant> {
    const plant = await this.findPlantById(plantId);
    plant.users = plant.users.filter((user) => !userIds.includes(user.id));
    return this.plantRepo.save(plant);
  }
}