import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdminsService } from 'src/admins/admins.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { Admin } from 'src/admins/admin.entity';
import { createHash, randomBytes } from 'crypto';

export const FINGERPRINT_COOKIE_NAME = 'fp';
export const FINGERPRINT_COOKIE_MAX_AGE = 1000 * 60 * 60 * 16; // 16 hours

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminsService: AdminsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUser(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateAdmin(name: string, password: string): Promise<any> {
    const admin = await this.adminsService.findAdmin(name);
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async loginUser(user: User) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      firstName: user.firstName,
      phone: user.phone,
    };
  }

  async loginAdmin(admin: Admin) {
    const payload = { adminName: admin.name, sub: admin.id };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
    };
  }

  sha256(value: string) {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }

  genFingerPrint() {
    return randomBytes(50).toString('hex');
  }
}
