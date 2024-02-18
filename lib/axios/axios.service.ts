import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AxiosService {
  async get(url: string, apiKey?: string, params?: Object): Promise<any> {
    try {
      const config: any = {
        headers: {},
        params: params || {},
      };

      if (apiKey) {
        config.headers['x-api-key'] = apiKey;
      }

      Logger.debug(`AxiosService is getting ${url}`);
      Logger.debug(
        `AxiosService is getting with config: ${JSON.stringify(config)}`,
      );

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      Logger.error(error.response ? error.response.data : error.message);
      throw error;
    }
  }
}
