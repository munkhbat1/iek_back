import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/auth/guards/admin-jwt-auth.guard';
import { UserJwtAuthGuard } from 'src/auth/guards/user-jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaymentStatus } from './order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Get()
  async findAll(@Query('page') page: number) {
    const items = await this.ordersService.findAll(page);
    return {
      items: items.map((item) => {
        item.status = PaymentStatus[item.status];
        return item;
      }),
      total_pages: await this.ordersService.totalPages(),
    };
  }

  @UseGuards(UserJwtAuthGuard)
  @Post()
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.createOrder(
      req.user.userId,
      createOrderDto,
    );
  }

  @UseGuards(UserJwtAuthGuard)
  @Get('users')
  async findAllByUserId(
    @Request() req,
    @Query('page') page: number,
    @Query('userId') userId: number,
  ) {
    if (parseInt(req.user.userId) !== parseInt(userId.toString())) {
      throw new HttpException(
        "Couldn't get orders by user id",
        HttpStatus.UNAUTHORIZED,
      );
    }
    const items = await this.ordersService.findAll(page, userId);
    return {
      items: items.map((item) => {
        item.status = PaymentStatus[item.status];
        return item;
      }),
      total_pages: await this.ordersService.totalPages(),
    };
  }

  @UseGuards(UserJwtAuthGuard)
  @Get(':id')
  async getOrder(@Param('id') orderId: number) {
    return await this.ordersService.getOrder(orderId);
  }

  @UseGuards(UserJwtAuthGuard)
  @Get('details/:id')
  async getOrderDetail(@Param('id') orderId: number) {
    return await this.ordersService.getOrderDetail(orderId);
  }
}
