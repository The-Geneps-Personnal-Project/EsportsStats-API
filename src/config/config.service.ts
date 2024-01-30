import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  get port(): number {
    return this.nestConfigService.get<number>('PORT');
  }

  get databaseUrl(): string {
    return this.nestConfigService.get<string>('DATABASE_URL');
  }
}
