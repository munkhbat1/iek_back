import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Redirect,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';
import { UserLocalAuthGuard } from 'src/auth/guards/user-local-auth.guard';
import { CreateUserDto } from './create-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('auth/signUp')
  @Redirect('login', HttpStatus.TEMPORARY_REDIRECT)
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      await this.usersService.createUser(createUserDto);
    } catch (error) {
      throw new HttpException(
        "Couldn't create a user. Already exists.",
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return { email: createUserDto.email, password: createUserDto.password };
  }

  @UseGuards(UserLocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.loginUser(req.user);
  }

  @UseGuards(UserJwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
