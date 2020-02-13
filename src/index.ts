import {
  Options, Connection, Channel, ConsumeMessage, Message,
} from 'amqplib';
import * as Logger from 'bunyan';
import * as path from 'path';
import * as readDirFilenames from 'read-dir-filenames';

import createBunyanLogger from './logger';
import createRabbitClient from './connect';

export interface GalenRabbitOptions {
  amqpUrl: string | Options.Connect
  logPath: string
}

export declare class BaseGalenRabbitClass {
  public onMsg (message: ConsumeMessage): any | Promise<any>
}

export class GalenRabbit {
  private options: GalenRabbitOptions;

  public logger: Logger;

  constructor(options: GalenRabbitOptions) {
    this.options = options;
    this.logger = createBunyanLogger(options.logPath);
  }

  async createClient() {
    return createRabbitClient(this.options.amqpUrl, this.logger);
  }

  // eslint-disable-next-line class-methods-use-this
  async consume(client: Connection, channelName: string, func: Function) {
    const channel: Channel = await client.createChannel();
    await channel.assertQueue(channelName);
    await channel.consume(
      channelName,
      async (message: ConsumeMessage | null) => {
        await func(message);
        channel.ack(message as Message);
      },
    );
  }

  async dynamicConsume(consumeDirPath: string) {
    const client = await this.createClient();
    const consumePaths: string[] = await readDirFilenames(consumeDirPath);
    await consumePaths.reduce(async (promise, consumePath) => {
      await promise;
      const [channelName] = path.basename(consumePath).split('.');
      await this.consume(client, channelName, async (message: ConsumeMessage | null) => {
        if (!message) {
          this.logger.error('[galen-RabbitMQ.error]: message is null');
          return;
        }
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const consumeClass: BaseGalenRabbitClass = require(consumePath);
        consumeClass.onMsg(message);
      });
    }, Promise.resolve());
  }
}
