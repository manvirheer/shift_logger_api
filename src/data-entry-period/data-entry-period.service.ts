// src/data-entry-period/data-entry-period.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plant } from 'src/plant/entities/plant.entity';
import { Repository } from 'typeorm';
import { CreateDataEntryPeriodDto } from './dtos/create-data-entry-period.dto';
import { UpdateDataEntryPeriodDto } from './dtos/update-data-entry-period.dto';
import { DataEntryPeriod } from './entities/data-entry-period.entity';

interface PeriodEntry {
  entryPeriod: string;
  entryDate: string;
}

@Injectable()
export class DataEntryPeriodService {
  // Initialize a global minuteMap with 1440 entries, each being a Map of plantId to PeriodEntry
  private minuteMap: Array<Map<string, PeriodEntry>> = Array.from(
    { length: 1440 },
    () => new Map<string, PeriodEntry>(),
  );

  private readonly MAX_TRIES = 3;

  constructor(
    @InjectRepository(DataEntryPeriod)
    private readonly dataEntryPeriodRepo: Repository<DataEntryPeriod>,
    @InjectRepository(Plant)
    private readonly plantRepo: Repository<Plant>,
  ) {}

  async onModuleInit() {
    await this.refreshAllPeriodMaps();
  }

  /**
   * Refresh the entire minuteMap by clearing existing entries and repopulating them.
   */
  private async refreshAllPeriodMaps(): Promise<void> {
    // Clear the current minuteMap
    for (let i = 0; i < 1440; i++) {
      this.minuteMap[i].clear();
    }

    const plants = await this.plantRepo.find();
    for (const plant of plants) {
      await this.refreshPlantPeriodMap(plant.plantId);
    }
  }

  /**
   * Refresh the minuteMap for a specific plant by updating the relevant minutes.
   * @param plantId The ID of the plant to refresh.
   */
  private async refreshPlantPeriodMap(plantId: string): Promise<void> {
    const periods = await this.dataEntryPeriodRepo.find({
      where: { plant: { plantId } },
    });

    for (const period of periods) {
      const startMinute = this.timeToMinutes(period.startTime);
      const endMinute = this.timeToMinutes(period.endTime);
      // date in format 'YYYY-MM-DD'
      const periodStartDate = new Date().toISOString().split('T')[0];
      if (startMinute > endMinute) {
        // Period crosses midnight
        for (let m = startMinute; m < 1440; m++) {
          this.minuteMap[m].set(plantId, {
            entryPeriod: period.periodCode,
            entryDate: periodStartDate,
          });
        }
        for (let m = 0; m <= endMinute; m++) {
          this.minuteMap[m].set(plantId, {
            entryPeriod: period.periodCode,
            // new Date() but subtract 1 day
            entryDate : new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
          });
        }
      } else {
        // Period within the same day
        for (let m = startMinute; m <= endMinute; m++) {
          this.minuteMap[m].set(plantId, {
            entryPeriod: period.periodCode,
            entryDate: periodStartDate,
          });
        }
      }
    }
  }

  /**
   * Convert a time string in 'HH:mm:ss' format to minutes since midnight.
   * Rounds up if seconds >= 30.
   * @param timeStr The time string to convert.
   * @returns The total minutes since midnight.
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (seconds >= 30) {
      totalMinutes += 1;
    }
    return totalMinutes % 1440; // Ensure it wraps around at midnight
  }

  /**
   * Retrieve all data entry periods with their associated plants.
   * @returns An array of DataEntryPeriod entities.
   */
  async findAll(): Promise<DataEntryPeriod[]> {
    return this.dataEntryPeriodRepo.find({
      relations: ['plant'],
    });
  }

  /**
   * Retrieve a single data entry period by its ID.
   * @param id The ID of the data entry period.
   * @returns The DataEntryPeriod entity.
   * @throws NotFoundException if the period is not found.
   */
  async findOne(id: string): Promise<DataEntryPeriod> {
    const period = await this.dataEntryPeriodRepo.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!period) {
      throw new NotFoundException(`Data entry period with ID ${id} not found`);
    }

    return period;
  }

  /**
   * Retrieve all data entry periods for a specific plant.
   * @param plantId The ID of the plant.
   * @returns An array of DataEntryPeriod entities.
   */
  async findByPlant(plantId: string): Promise<DataEntryPeriod[]> {
    return this.dataEntryPeriodRepo.find({
      where: { plant: { plantId } },
      relations: ['plant'],
    });
  }

  /**
   * Create a new data entry period and update the minuteMap accordingly.
   * @param createDto The DTO containing data for creation.
   * @returns The created DataEntryPeriod entity.
   * @throws NotFoundException if the plant is not found.
   * @throws BadRequestException if there is an overlapping period.
   */
  async create(createDto: CreateDataEntryPeriodDto): Promise<DataEntryPeriod> {
    const plant = await this.plantRepo.findOne({
      where: { plantId: createDto.plantId },
    });

    if (!plant) {
      throw new NotFoundException(
        `Plant with ID ${createDto.plantId} not found`,
      );
    }

    // Optional: Implement overlap validation if needed
    // Since you assume no overlaps, this is skipped

    const period = this.dataEntryPeriodRepo.create({
      ...createDto,
      plant,
    });

    const savedPeriod = await this.dataEntryPeriodRepo.save(period);
    await this.refreshPlantPeriodMap(savedPeriod.plant.plantId);
    return savedPeriod;
  }

  /**
   * Update an existing data entry period and refresh the minuteMap.
   * @param id The ID of the period to update.
   * @param updateDto The DTO containing update data.
   * @returns The updated DataEntryPeriod entity.
   * @throws NotFoundException if the period or plant is not found.
   */
  async update(
    id: string,
    updateDto: UpdateDataEntryPeriodDto,
  ): Promise<DataEntryPeriod> {
    const period = await this.dataEntryPeriodRepo.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!period) {
      throw new NotFoundException(`Data entry period with ID ${id} not found`);
    }

    const oldPlantId = period.plant.plantId;

    if (updateDto.plantId) {
      const newPlant = await this.plantRepo.findOne({
        where: { plantId: updateDto.plantId },
      });

      if (!newPlant) {
        throw new NotFoundException(
          `Plant with ID ${updateDto.plantId} not found`,
        );
      }

      period.plant = newPlant;
    }

    Object.assign(period, updateDto);
    const updatedPeriod = await this.dataEntryPeriodRepo.save(period);

    // Refresh minuteMap for both old and new plant if plantId changed
    await this.refreshPlantPeriodMap(updatedPeriod.plant.plantId);
    if (updateDto.plantId && oldPlantId !== updateDto.plantId) {
      await this.refreshPlantPeriodMap(oldPlantId);
    }

    return updatedPeriod;
  }

  /**
   * Remove a data entry period and update the minuteMap.
   * @param id The ID of the period to remove.
   * @throws NotFoundException if the period is not found.
   */
  async remove(id: string): Promise<void> {
    const period = await this.dataEntryPeriodRepo.findOne({
      where: { id },
      relations: ['plant'],
    });

    if (!period) {
      throw new NotFoundException(`Data entry period with ID ${id} not found`);
    }

    const plantId = period.plant.plantId;
    await this.dataEntryPeriodRepo.remove(period);
    await this.refreshPlantPeriodMap(plantId);
  }

  /**
   * Find the current period and date for a given plant based on the provided time.
   * @param plantId The ID of the plant.
   * @param time The current time.
   * @returns An object containing entryPeriod and entryDate, or null if not found.
   */
  async findPeriodForTime(
    plantId: string,
    time: Date,
  ): Promise<{ entryPeriod: string; entryDate: string } | null> {
    const currentMinute =
      time.getHours() * 60 + time.getMinutes();
    const adjustedMinute =
      (currentMinute + (time.getSeconds() >= 30 ? 1 : 0)) % 1440;

    const plantEntry = this.minuteMap[adjustedMinute].get(plantId);
    if (plantEntry) {
      return plantEntry;
    } else {
      return null;
    }
  }

  /**
   * Validate that all minutes are covered for a specific plant.
   * Implements a maximum number of retries to prevent infinite recursion.
   * @param plantId The ID of the plant.
   * @param tries The current number of attempts.
   * @returns True if coverage is complete, false otherwise.
   * @throws Error if maximum retries are exceeded.
   */
  async validatePeriodCoverage(
    plantId: string,
    tries = 0,
  ): Promise<boolean> {
    if (tries >= this.MAX_TRIES) {
      throw new Error(
        'Maximum retries exceeded while validating period coverage',
      );
    }

    const coverageComplete = this.minuteMap.every((minuteEntry) =>
      minuteEntry.has(plantId),
    );

    if (!coverageComplete) {
      await this.refreshPlantPeriodMap(plantId);
      return this.validatePeriodCoverage(plantId, tries + 1);
    }

    return true;
  }
}
