import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Admin } from './admin.entity';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([Admin])],
  providers: [AdminsService],
  exports: [AdminsService],
  controllers: [AdminsController],
})
export class AdminsModule {}
