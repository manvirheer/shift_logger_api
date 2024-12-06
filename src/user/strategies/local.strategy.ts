import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';

// Local strategy for validating user credentials
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({ usernameField: 'username' }); 
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.userService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return user;
  }
}
