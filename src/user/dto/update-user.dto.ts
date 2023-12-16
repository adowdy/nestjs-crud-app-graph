import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// PartialType automatically makes all properties of CreateUserDto optional in UpdateUserDto
export class UpdateUserDto extends PartialType(CreateUserDto) {
    // ... other attributes
    relations: number[]; // Array of user IDs
  }