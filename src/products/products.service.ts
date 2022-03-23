import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';
import { ProductsRepository } from './products.repository';
import { unlink } from 'fs';
import { ProductCategoriesRepository } from './product-categories.repository';
import { ProductCategory } from './product-category.entity';

@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private categoryRepository: ProductCategoriesRepository,
  ) {}

  async create(product: Partial<Product>) {
    return await this.productsRepository.save(product);
  }

  findAll(page: number, category: string) {
    return this.productsRepository.findAndPaginate(page, category);
  }

  findOne(id: number) {
    return this.productsRepository.findOneWithCategory(id);
  }

  async update(product: Partial<Product>, id: number) {
    const currentProduct = await this.productsRepository.findOne(id);
    if (currentProduct.images) {
      currentProduct.images.forEach((image) => {
        unlink(`${process.cwd()}/public/uploads/images/${image}`, (err) => {
          err && console.error(err);
          return;
        });
      });
    }
    product = { ...currentProduct, ...product };
    await this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.productsRepository.findOne({ id });
    product.images.forEach((image) => {
      unlink(`${process.cwd()}/public/uploads/images/${image}`, (err) => {
        err && console.error(err);
        return;
      });
    });

    return await this.productsRepository.remove(product);
  }

  async totalPages(category: string) {
    return await this.productsRepository.totalPages(category);
  }

  async getProductCategoryByValue(name: string): Promise<ProductCategory> {
    return await this.categoryRepository.findOne({ value: name });
  }

  async findAllCategories() {
    return await this.categoryRepository.find();
  }

  async searchProducts(keyword: string) {
    return await this.productsRepository.searchProducts(keyword);
  }

  findSpecialProducts() {
    return this.productsRepository.specialProducts();
  }
}
