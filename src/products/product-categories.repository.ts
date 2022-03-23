import { OnApplicationBootstrap } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ProductCategory } from './product-category.entity';

@EntityRepository(ProductCategory)
export class ProductCategoriesRepository
  extends Repository<ProductCategory>
  implements OnApplicationBootstrap
{
  async onApplicationBootstrap() {
    await this.save([
      { key: 'TOOLUUR_HEMJIH_HEREGSEL', value: 'Тоолуур, хэмжих хэрэгсэл' },
      { key: 'AUTOMAT_TASLUUR', value: 'Автомат таслуур' },
      { key: 'CABEL_DAGALDAH_HEREGSEL', value: 'Кабель, дагалдах хэрэгсэл' },
      { key: 'HUCHDEL_TOGTVORJUULAGCH', value: 'Хүчдэл тогтворжуулагч' },
      { key: 'GERELTUULEG', value: 'Гэрэлтүүлэг' },
      { key: 'UNTRAALGA', value: 'Унтраалга, розетка' },
      { key: 'SAMBARIIN_TONOGLOL', value: 'Самбарын тоноглол' },
      { key: 'BUSAD', value: 'Бусад' },
    ]);
  }
}

export const PER_PAGE = 10;
