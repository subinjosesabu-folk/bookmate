import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "admin@example.com",
    description: "Default seeded admin email",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "Admin@123",
    description: "Default seeded admin password",
  })
  @IsNotEmpty()
  password!: string;
}
