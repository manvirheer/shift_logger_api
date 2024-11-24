import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

// Custom decorator to set required roles for a route
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
