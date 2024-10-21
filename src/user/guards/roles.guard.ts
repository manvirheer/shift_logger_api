import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredTypes = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      if (!requiredTypes) {
        return true; // No roles required, allow access
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
  
      if (requiredTypes.includes(user.type)) {
        return true;
      } else {
        throw new ForbiddenException('Insufficient permissions');
      }
    }
  }
  