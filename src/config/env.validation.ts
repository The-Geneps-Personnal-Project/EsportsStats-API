import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from '@nestjs/class-validator';
import { Logger } from '@nestjs/common';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  MONGO_URI: string;

  @IsString()
  LOL_ESPORTS_API_KEY: string;

  @IsNumber()
  @IsOptional()
  LEAGUES_FREQUENCY: number;

  @IsNumber()
  @IsOptional()
  TOURNAMENTS_FREQUENCY: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    Logger.error(`Error in configuration file: ${errors.toString()}`);
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
