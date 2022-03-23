import { EntityRepository, Repository } from 'typeorm';
import { Blog } from './blog.entity';

@EntityRepository(Blog)
export class BlogsRepository extends Repository<Blog> {
  findAndPaginate(page: number, type: string) {
    page ||= 1;
    page = parseInt(page.toString());

    let query = this.createQueryBuilder('blog');
    if (type) {
      query = query.where('type = :type', { type: type });
    }

    return query
      .orderBy('updatedAt', 'DESC')
      .offset((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .getMany();
  }

  async totalPages(type: string) {
    let query = this.createQueryBuilder('blog');
    if (type) {
      query = query.where('type = :type', { type: type });
    }
    return Math.ceil((await query.getCount()) / PER_PAGE);
  }
}

export const PER_PAGE = 10;
