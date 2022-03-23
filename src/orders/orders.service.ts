import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { bankNames } from './constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderDetail } from './order-detail.entity';
import { Order, PaymentStatus } from './order.entity';

@Injectable()
export class OrdersService {
  PER_PAGE = 10;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private orderDetailssRepository: Repository<OrderDetail>,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { access_token } = await this.getAccessToken();

    const QPAY_API_URI = this.configService.get<string>('QPAY_API_URI');
    const QPAY_INVOICE_CODE =
      this.configService.get<string>('QPAY_INVOICE_CODE');
    const maxOrderId = await this.ordersRepository
      .createQueryBuilder()
      .orderBy('id', 'DESC')
      .limit(1)
      .getOne();
    const maxOrderIdPlusOne = (maxOrderId && maxOrderId.id + 1) || 1;

    let res;
    try {
      res = await axios.post(
        `${QPAY_API_URI}/invoice`,
        {
          invoice_code: QPAY_INVOICE_CODE,
          sender_invoice_no: maxOrderIdPlusOne.toString(),
          invoice_receiver_code: userId.toString(),
          invoice_description: 'invoice',
          amount: createOrderDto.amount,
          callback_url: `emontaj://orders?order_id=${maxOrderIdPlusOne}`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        "Couldn't create a invoice",
        HttpStatus.BAD_REQUEST,
      );
    }

    const updateOrderDto = res.data as UpdateOrderDto;
    updateOrderDto.urls = updateOrderDto.urls.filter((url) =>
      bankNames.includes(url.name),
    );

    const newOrder = await this.ordersRepository.save({
      ...createOrderDto,
      invoice_id: updateOrderDto.invoice_id,
      qr_text: updateOrderDto.qr_text,
      qr_image: updateOrderDto.qr_image,
      urls: JSON.stringify(updateOrderDto.urls),
      amount: createOrderDto.amount,
      user_id: userId,
      status: `${PaymentStatus.NEW}`,
    });

    for (let i = 0; i < createOrderDto.cartItems.length; i++) {
      const cartItem = createOrderDto.cartItems[i];
      const newOrderDetail = await this.orderDetailssRepository.save({
        orderId: newOrder.id,
        productId: cartItem.productId,
        productName: cartItem.productName,
        unitPrice: cartItem.unitPrice,
        quantity: cartItem.quantity,
        requirement: cartItem.option,
      });
    }

    return newOrder.id;
  }

  private async getAccessToken() {
    const QPAY_API_URI = this.configService.get<string>('QPAY_API_URI');
    const QPAY_USERNAME = this.configService.get<string>('QPAY_USERNAME');
    const QPAY_PASSWORD = this.configService.get<string>('QPAY_PASSWORD');

    const res = await axios.post(
      `${QPAY_API_URI}/auth/token`,
      {},
      {
        auth: {
          username: QPAY_USERNAME,
          password: QPAY_PASSWORD,
        },
      },
    );

    return res.data;
  }

  async getOrderDetail(orderId: number) {
    await this.paymentCheck(orderId);
    const order = await this.ordersRepository.findOne({
      id: orderId,
    });

    if (!order) {
      throw new HttpException("Couldn't get an order", HttpStatus.BAD_REQUEST);
    }

    const { qr_image, qr_text, urls, ...newOrder } = order;
    newOrder.status = PaymentStatus[newOrder.status];
    const orderDetails = await this.orderDetailssRepository.find({
      orderId: order.id,
    });

    return {
      order: newOrder,
      orderDetails: orderDetails,
    };
  }

  async findAll(page: number, userId?: number) {
    page ||= 1;
    page = parseInt(page.toString());

    let query = this.ordersRepository.createQueryBuilder('order');

    if (userId) {
      query = query.where('user_id = :userId', { userId: userId });
      query = query.orderBy('createdAt', 'DESC');
    }

    const orders = await query
      .orderBy('status', 'ASC')
      .orderBy('updatedAt', 'DESC')
      .offset((page - 1) * this.PER_PAGE)
      .limit(this.PER_PAGE)
      .getMany();

    for (let i = 0; i < orders.length; i++) {
      await this.paymentCheck(orders[i].id);
    }

    return query
      .orderBy('status', 'ASC')
      .orderBy('updatedAt', 'DESC')
      .offset((page - 1) * this.PER_PAGE)
      .limit(this.PER_PAGE)
      .getMany();
  }

  async totalPages() {
    const query = this.ordersRepository.createQueryBuilder('order');
    return Math.ceil((await query.getCount()) / this.PER_PAGE);
  }

  async getOrder(orderId: number) {
    const order = await this.ordersRepository.findOne({
      id: orderId,
    });
    const { qr_image, ...newOrder } = order;
    return newOrder;
  }

  async paymentCheck(orderId: number) {
    const { access_token } = await this.getAccessToken();
    const QPAY_API_URI = this.configService.get<string>('QPAY_API_URI');
    const order = await this.ordersRepository.findOne({
      id: orderId,
    });

    let res;
    try {
      res = await axios.post(
        `${QPAY_API_URI}/payment/check`,
        {
          object_type: 'INVOICE',
          object_id: order && order.invoice_id,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
    } catch (error) {
      console.error(error.message);
      throw new HttpException("Couldn't get payments", HttpStatus.BAD_REQUEST);
    }

    if (res.data.rows.length > 0) {
      order.status = PaymentStatus[res.data.rows[0].payment_status];
      await this.ordersRepository.save(order);
    }
  }
}
