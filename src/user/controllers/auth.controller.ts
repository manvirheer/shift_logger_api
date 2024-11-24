import {
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { AuthGuard } from '@nestjs/passport';
  import { UserService } from '../user.service';
  
  // Controller for authentication endpoints
  @UseInterceptors(ClassSerializerInterceptor)
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly userService: UserService,
      private readonly jwtService: JwtService,
    ) {}
  
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
      const user = req.user;
      const payload = { sub: user.id, email: user.email, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    async getProfile(@Request() req) {
      const user = await this.userService.findById(req.user.id);
      return user;
    }
  }
  