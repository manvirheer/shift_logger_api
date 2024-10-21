import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Staff } from './entities/staff.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { CreateStaffDto } from './dtos/create-staff.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = this.userRepo.create({
      ...createAdminDto,
      type: 'Admin',
    }) as Admin;
    return this.userRepo.save(admin);
  }

  async createStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    const staff = this.userRepo.create({
      ...createStaffDto,
      type: 'Staff',
    }) as Staff;
    return this.userRepo.save(staff);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({
      where: { email },
    });
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.remove(user);
  }

  // get all users 
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
  // Additional methods as needed
}
