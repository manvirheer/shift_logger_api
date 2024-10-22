import { IsUUID, IsArray } from 'class-validator';

export class UsersIdsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  userIds: string[];
}