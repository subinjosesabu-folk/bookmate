import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, Length, IsNotEmpty, IsOptional } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Saynora Sibu", description: "Full name of the user" })
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ example: "saynora@example.com", description: "Unique email address" })
  @IsEmail()
  @Length(5, 150)
  email!: string;

  @ApiProperty({ example: "Password123!", description: "Password (min 6 chars)" })
  @IsNotEmpty()
  @Length(6, 50)
  password!: string;  

  @ApiProperty({ example: "user", required: false })
  @IsOptional()
  roleName?: string;
}
