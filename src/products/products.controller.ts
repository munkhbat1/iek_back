import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Put,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminJwtAuthGuard } from 'src/auth/guards/admin-jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @UploadedFiles() images: Express.Multer.File[], // file automatically saved
    @Body() body: CreateProductDto,
  ) {
    await this.productsService.create({
      name: body.name,
      images: images.map((i) => i.filename),
      price: parseInt(body.price),
      remaining: parseInt(body.remaining),
      requirements: body.requirements,
      category: body.category,
      type: body.type,
    });
  }

  @Get()
  async findAll(
    @Query('category') category: string,
    @Query('page') page: number,
  ) {
    return {
      items: await this.productsService.findAll(page, category),
      total_pages: await this.productsService.totalPages(category),
    };
  }

  @Get('special')
  getSpecialProducts() {
    return this.productsService.findSpecialProducts();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('categories')
  getAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('search')
  searchProduct(@Query('keyword') keyword: string) {
    return this.productsService.searchProducts(keyword);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: number,
    @Body() body: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[], // file automatically saved
  ) {
    await this.productsService.update(
      {
        name: body.name,
        images: images.map((i) => i.filename),
        price: parseInt(body.price),
        remaining: parseInt(body.remaining),
        requirements: body.requirements,
        category: body.category,
        type: body.type,
      },
      id,
    );
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
