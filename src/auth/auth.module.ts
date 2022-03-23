import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminsModule } from 'src/admins/admins.module';
import { UsersModule } from 'src/users/users.module';
import { AdminLocalStrategy } from './strategies/admin-local.strategy';
import { AuthService } from './auth.service';
import { UserLocalStrategy } from './strategies/user-local.strategy';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { AdminJwtRefreshStrategy } from './strategies/admin-jwt-refresh.strategy';

@Module({
  providers: [
    AuthService,
    UserLocalStrategy,
    AdminLocalStrategy,
    UserJwtStrategy,
    AdminJwtStrategy,
    AdminJwtRefreshStrategy,
  ],
  imports: [
    PassportModule,
    forwardRef(() => UsersModule),
    forwardRef(() => AdminsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5h' },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
