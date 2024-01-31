import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}
  getHello(): string {
    Logger.log(this.configService.get<string>('PORT'));
    return 'Hello World!';
  }
}
