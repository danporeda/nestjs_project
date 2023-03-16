import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePaymentOrderDTO } from './dtos/createPaymentOrder.dto';
import { FulfillPaymentOrderDTO } from './dtos/fulfillPaymentOrder.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('contract-address')
  getContractAddress(): string {
    return this.appService.getContractAddress();
  }

  @Get('total-supply')
  async getTotalSupply(): Promise<number> {
    return await this.appService.getTotalSupply();
  }

  // @Get('allowance/:from/:to')
  // async getAllowance(
  //   @Param('from') from: string,
  //   @Param('to') to: string,
  // ): Promise<number> {
  //   return await this.appService.getAllowance(from, to);
  // }

  @Get('allowance')
  async getAllowance(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<number> {
    return await this.appService.getAllowance(from, to);
  }

  @Get('transaction-status')
  async getTransactionStatus(@Query('hash') hash: string): Promise<string> {
    return await this.appService.getTransactionStatus(hash);
  }

  @Get('payment-orders')
  getPaymentOrders() {
    return this.appService.getPaymentOrders();
  }

  @Post('payment-order')
  creatPaymentOrder(@Body() body: CreatePaymentOrderDTO) {
    return this.appService.createPaymentOrder(body.value, body.secret);
  }

  @Post('fulfill-payment-order')
  fullfillPaymentOrder(@Body() body: FulfillPaymentOrderDTO) {
    return this.appService.fulfillPaymentOrder(
      body.id,
      body.secret,
      body.address,
    );
  }
}
