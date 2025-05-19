import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/schemas/user.schema';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';

/**
 * 사용자 데이터에서 비밀번호를 제외한 응답 DTO로 변환하는 헬퍼 함수
 */
function mapToUserResponse(user: User): UserResponseDto {
  // 비밀번호 필드 제외
  const { password, ...userResponse } = user as any;
  return userResponse as UserResponseDto;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string): Promise<User> {
    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // bcrypt를 사용하여 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.userId, loginDto.password);

    // 로그인 카운트 증가
    await this.usersService.incrementLoginCount(user.userId);

    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    // 헬퍼 함수를 사용하여 UserResponseDto로 변환
    const userResponse = mapToUserResponse(user);

    return {
      access_token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async signup(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // bcrypt를 사용하여 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = {
      ...createUserDto,
      password: hashedPassword,
    };

    const createdUser = await this.usersService.create(newUser);

    // 헬퍼 함수를 사용하여 UserResponseDto로 변환
    return mapToUserResponse(createdUser);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 헬퍼 함수를 사용하여 UserResponseDto로 변환
    return mapToUserResponse(user);
  }
}
