import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsRepository } from './products.repository';
import { ProductCategoriesRepository } from './product-categories.repository';
@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
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
    TypeOrmModule.forFeature([ProductsRepository, ProductCategoriesRepository]),
  ],
})
export class ProductsModule {}
