import { config } from 'dotenv';
config();

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { ConfigurationModule } from './config.module';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    console.log('Environment Variables:', process.env);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should get the correct port', () => {
    expect(service.port).toBe(3000);
  });

  it('should get the correct database URL', () => {
    expect(service.databaseUrl).toBe('TEST');
  });
});
