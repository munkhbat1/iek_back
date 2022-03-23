import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsRepository } from './blogs.repository';

@Module({
  controllers: [BlogsController],
  providers: [BlogsService],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: `${process.cwd()}/public/uploads/images`,
        filename: (_, file, cb) => {
          if (!file) {
            return;
          }
          const extension = file.mimetype.split('/')[1];
          const filename = uuidv4();
          cb(null, `${filename}.${extension}`);
        },
      }),
    }),
    TypeOrmModule.forFeature([BlogsRepository]),
  ],
})
export class BlogsModule {}
