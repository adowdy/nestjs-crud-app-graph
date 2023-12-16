export class CreateUserDto {
    id: number; // unique ID
    relations: number[]; // Array of other user IDs
  }