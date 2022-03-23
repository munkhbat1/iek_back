import { EntityRepository, Repository } from 'typeorm';
import { Product } from './product.entity';

@EntityRepository(Product)
export class ProductsRepository extends Repository<Product> {
  findAndPaginate(page: number, category: string) {
    page ||= 1;
    page = parseInt(page.toString());

    let query = this.createQueryBuilder('product');
    if (category) {
      query = query.where('categoryKey = :category', { category: category });
    }

    return query
      .orderBy('updatedAt', 'DESC')
      .offset((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .getMany();
  }

  async totalPages(category: string) {
    let query = this.createQueryBuilder('product');
    if (category) {
      query = query.where('categoryKey = :category', { category: category });
    }
    return Math.ceil((await query.getCount()) / PER_PAGE);
  }

  async searchProducts(keyword: string) {
    const query = this.createQueryBuilder('product').where(
      'MATCH(name, requirements) AGAINST(:keyword)',
      { keyword: keyword },
    );

    return query.getMany();
  }

  specialProducts() {
    const query = this.createQueryBuilder('product');

    return query
      .where('type = :special', { special: 'SPECIAL' })
      .orderBy('updatedAt', 'DESC')
      .getMany();
  }

  findOneWithCategory(id: number) {
    return this.createQueryBuilder('product')
      .innerJoinAndSelect('product.category', 'product_category')
      .where('product.id = :id', { id: id })
      .getOne();
  }
}

export const PER_PAGE = 10;
