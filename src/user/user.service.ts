import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Staff } from './entities/staff.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';

// Service for user operations
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    private readonly dataSource: DataSource,
  ) {}

  // Create a new admin user within a transaction
  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = this.userRepo.create({
        ...createAdminDto,
        role: UserRole.ADMIN,
      });

      const savedUser = await manager.save(user);

      const admin = this.adminRepo.create({
        id: savedUser.id,
        user: savedUser,
      });

      await manager.save(admin);

      return savedUser;
    });
  }

  // Create a new staff user within a transaction
  async createStaff(createStaffDto: CreateStaffDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = this.userRepo.create({
        ...createStaffDto,
        role: UserRole.STAFF,
      });

      const savedUser = await manager.save(user);

      const staff = this.staffRepo.create({
        id: savedUser.id,
        user: savedUser,
        a2pEmpId: createStaffDto.a2pEmpId,
        fatherName: createStaffDto.fatherName,
        areaOfWork: createStaffDto.areaOfWork,
        natureOfWork: createStaffDto.natureOfWork,
      });

      await manager.save(staff);

      return savedUser;
    });
  }

  // Find all admins with optional relations
  async findAllAdmins(relations: string[] = []): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.ADMIN },
      relations,
    });
  }

  // Find an admin by ID with optional relations
  async findAdminById(id: string, relations: string[] = []): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { id, role: UserRole.ADMIN },
      relations,
    });
  }

  // Find all staff with optional relations
  async findAllStaff(relations: string[] = []): Promise<User[]> {
    return this.userRepo.find({
      where: { role: UserRole.STAFF },
      relations,
    });
  }

  // Find a staff by ID with optional relations
  async findStaffById(id: string, relations: string[] = []): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { id, role: UserRole.STAFF },
      relations,
    });
  }

  // Update an admin user within a transaction
  async updateAdmin(id: string, updateAdminDto: UpdateAdminDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id, role: UserRole.ADMIN } });
      if (!user) {
        throw new NotFoundException('Admin not found');
      }

      if (updateAdminDto.password) {
        updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
      }

      Object.assign(user, updateAdminDto);
      await manager.save(user);

      // Update admin-specific fields if any

      return user;
    });
  }

  // Update a staff user within a transaction
  async updateStaff(id: string, updateStaffDto: UpdateStaffDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id, role: UserRole.STAFF } });
      if (!user) {
        throw new NotFoundException('Staff not found');
      }

      if (updateStaffDto.password) {
        updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
      }

      Object.assign(user, updateStaffDto);
      await manager.save(user);

      const staff = await manager.findOne(Staff, { where: { id: user.id } });
      if (staff) {
        Object.assign(staff, updateStaffDto);
        await manager.save(staff);
      }

      return user;
    });
  }

  // Remove an admin user within a transaction
  async removeAdmin(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id, role: UserRole.ADMIN } });
      if (!user) {
        throw new NotFoundException('Admin not found');
      }

      await manager.delete(Admin, id);
      await manager.delete(User, id);
    });
  }

  // Remove a staff user within a transaction
  async removeStaff(id: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, { where: { id, role: UserRole.STAFF } });
      if (!user) {
        throw new NotFoundException('Staff not found');
      }

      await manager.delete(Staff, id);
      await manager.delete(User, id);
    });
  }

  // Additional methods for authentication
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userRepo.findOne({
      where: { id },
    });
  }
}
