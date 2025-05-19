import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string): Promise<any> {
    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 실제 환경에서는 비밀번호를 해싱해야 합니다
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // 현재는 해싱 없이 비교합니다 (개발 환경용)
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.userId, loginDto.password);

    // 로그인 카운트 증가
    await this.usersService.incrementLoginCount(user.userId);

    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        userId: user.userId,
        email: user.email,
        nickName: user.nickName,
        role: user.role,
      },
    };
  }

  async signup(createUserDto: CreateUserDto) {
    // 비밀번호 해싱 (실제 환경에서 사용)
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // const newUser = { ...createUserDto, password: hashedPassword };

    // 현재는 해싱 없이 저장 (개발 환경용)
    const newUser = createUserDto;

    return this.usersService.create(newUser);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findByUserId(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 비밀번호 제외하고 반환
    const { password, ...result } = user.toObject();
    return result;
  }
}
