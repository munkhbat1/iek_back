import { Injectable } from '@nestjs/common';
import { unlink } from 'fs';
import { Blog } from './blog.entity';
import { BlogsRepository } from './blogs.repository';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async create(blog: Partial<Blog>) {
    return await this.blogsRepository.save(blog);
  }

  totalPages(type: string) {
    return this.blogsRepository.totalPages(type);
  }

  async findAll(page: number, type: string) {
    let allBlogs = await this.blogsRepository.findAndPaginate(page, type);
    allBlogs = allBlogs.map((blog) => {
      return {
        ...blog,
        blog_body: blog.blog_body.split('\n')[0],
      };
    });

    return allBlogs;
  }

  findOne(id: number) {
    return this.blogsRepository.findOne(id);
  }

  async remove(id: number) {
    const blog = await this.blogsRepository.findOne({ id });
    if (blog.image) {
      unlink(`${process.cwd()}/public/uploads/images/${blog.image}`, (err) => {
        err && console.error(err);
        return;
      });
    }

    return await this.blogsRepository.remove(blog);
  }

  async update(blog: Partial<Blog>, id: number) {
    const currentBlog = await this.blogsRepository.findOne(id);
    if (currentBlog.image) {
      unlink(
        `${process.cwd()}/public/uploads/images/${currentBlog.image}`,
        (err) => {
          err && console.error(err);
          return;
        },
      );
    }
    blog = { ...currentBlog, ...blog };
    await this.blogsRepository.save(blog);
  }
}
