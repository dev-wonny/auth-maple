import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../../../libs/common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  nickName: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsBoolean()
  @IsOptional()
  isBlocked?: boolean;

  @IsDate()
  @IsOptional()
  lastLoginAt?: Date;

  @IsNumber()
  @IsOptional()
  loginCount?: number;

  @IsString()
  @IsOptional()
  invitedBy?: string;

  @IsNumber()
  @IsOptional()
  loginDays?: number;
}
