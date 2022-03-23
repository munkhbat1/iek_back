import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminJwtAuthGuard } from 'src/auth/guards/admin-jwt-auth.guard';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: CreateBlogDto,
    @UploadedFile() image?: Express.Multer.File, // file automatically saved
  ) {
    await this.blogsService.create({
      title: body.title,
      image: (image && image.filename) || '',
      video_link: body.video_link,
      blog_body: body.blog_body,
      type: body.type,
    });
  }

  @Get()
  async findAll(@Query('type') type: string, @Query('page') page: number) {
    return {
      items: await this.blogsService.findAll(page, type),
      total_pages: await this.blogsService.totalPages(type),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(+id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(+id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() body: CreateBlogDto,
    @UploadedFile() image?: Express.Multer.File, // file automatically saved
  ) {
    await this.blogsService.update(
      {
        title: body.title,
        image: (image && image.filename) || '',
        video_link: body.video_link,
        blog_body: body.blog_body,
        type: body.type,
      },
      id,
    );
  }
}
