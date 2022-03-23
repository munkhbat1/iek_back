import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  NEW = 0,
  FAILED = 1,
  PAID = 2,
  REFUNDED = 3,
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoice_id: string;

  @Column()
  user_id: number;

  @Column()
  qr_text: string;

  @Column({
    type: 'text',
  })
  qr_image: string;

  @Column({
    type: 'text',
  })
  urls: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
