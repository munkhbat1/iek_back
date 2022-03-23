import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';

@Entity()
@Index(['name', 'requirements'], { fulltext: true })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  name: string;

  @Column({
    type: 'simple-array',
  })
  images: string[];

  @Column({
    type: 'double',
  })
  price: number;

  @Column()
  remaining: number;

  @Column({
    type: 'simple-array',
  })
  requirements: string[];

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductCategory, (productCategory) => productCategory.key)
  category: string;
}
