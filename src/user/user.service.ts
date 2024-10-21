import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/index';
import { User, UserRole } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Staff } from './entities/staff.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    // Create the user
    const user = this.userRepo.create({
      ...createAdminDto,
      role: UserRole.ADMIN,
    });

    // Save the user
    const savedUser = await this.userRepo.save(user);

    // Create the admin record
    const admin = this.adminRepo.create({
      id: savedUser.id, 
      user: savedUser,
    //   adminSpecificField: createAdminDto.adminSpecificField,
    });

    // Save the admin record
    await this.adminRepo.save(admin);

    return savedUser;
  }

  async createStaff(createStaffDto: CreateStaffDto): Promise<User> {
    // Create the user
    const user = this.userRepo.create({
      ...createStaffDto,
      role: UserRole.STAFF,
    });

    // Save the user
    const savedUser = await this.userRepo.save(user);

    // Create the staff record
    const staff = this.staffRepo.create({
      id: savedUser.id, // Use the same ID
      user: savedUser,
      a2pEmpId: createStaffDto.a2pEmpId,
      fatherName: createStaffDto.fatherName,
      areaOfWork: createStaffDto.areaOfWork,
      natureOfWork: createStaffDto.natureOfWork,
    });

    // Save the staff record
    await this.staffRepo.save(staff);

    return savedUser;
  }

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

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update common user fields
    Object.assign(user, updateUserDto);
    await this.userRepo.save(user);

    // Update specific fields based on user role
    if (user.role === UserRole.ADMIN) {
      const admin = await this.adminRepo.findOne({ where: { id: user.id } });
      if (admin) {
        Object.assign(admin, updateUserDto);
        await this.adminRepo.save(admin);
      }
    } else if (user.role === UserRole.STAFF) {
      const staff = await this.staffRepo.findOne({ where: { id: user.id } });
      if (staff) {
        Object.assign(staff, updateUserDto);
        await this.staffRepo.save(staff);
      }
    }

    return user;
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      await this.adminRepo.delete(id);
    } else if (user.role === UserRole.STAFF) {
      await this.staffRepo.delete(id);
    }

    await this.userRepo.delete(id);
  }
}