import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { PaymentOrder } from './models/paymentOrder.model';
import * as tokenJson from './assets/MyToken.json';
import * as dotenv from 'dotenv';
import { ConfigModule, ConfigService } from '@nestjs/config';

dotenv.config();

const CONTRACT_ADDRESS = '0xbA3F65C92DD04673e3e69528BE893Ae61adAfD7e';

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;
  paymentOrders: PaymentOrder[];

  constructor(protected configService: ConfigService) {
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      process.env.ALCHEMY_API_KEY,
    );
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      tokenJson.abi,
      this.provider,
    );
    this.paymentOrders = [];
    console.log('Bootstrap!');
  }

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN);
    const totalSupplyNumber = parseFloat(totalSupplyString);
    return totalSupplyNumber;
  }

  getContractAddress(): string {
    return this.contract.address;
  }

  async getAllowance(from: string, to: string): Promise<number> {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowanceString = ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1 ? 'Completed' : 'Reverted';
  }

  getPaymentOrders() {
    return this.paymentOrders;
  }

  createPaymentOrder(value: number, secret: string) {
    const newPaymentOrder = new PaymentOrder();
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret;
    newPaymentOrder.id = this.paymentOrders.length;
    this.paymentOrders.push(newPaymentOrder);
    return newPaymentOrder.id;
  }

  async fulfillPaymentOrder(id: number, secret: string, address: string) {
    const paymentOrder = this.paymentOrders.find((p) => p.id === id);
    if (!paymentOrder) {
      throw new NotFoundException('Payment Order not found');
    }
    if (secret != paymentOrder.secret) {
      throw new ForbiddenException('Invalid secret');
    }
    // const pkey = this.configService.get<string>('PRIVATE_KEY');
    // if (!pkey) {
    //   throw new InternalServerErrorException('Wrong server configuration');
    // }
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    const mintTx = await this.contract
      .connect(signer)
      .mint(address, paymentOrder.value);
    await mintTx.wait();
  }
}
