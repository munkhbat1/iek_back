import { CreateOrderDetailDto } from './create-order-detail.dto';

export class CreateOrderDto {
  name: string;
  phone: string;
  address: string;
  amount: number;
  cartItems: CreateOrderDetailDto[];
}
