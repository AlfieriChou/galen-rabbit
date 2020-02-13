import { Options, Connection, connect } from 'amqplib';
import * as Logger from 'bunyan';

const createRabbitClient = async (url: string | Options.Connect, logger: Logger) => {
  const connection: Connection = await connect(url);
  logger.error('[galen-RabbitMQ.connect]: Connect to RabbitMQ success!');
  connection.on('error', (err): void => {
    logger.error('[galen-RabbitMQ.error]: ', err);
  });
  connection.on('close', (): void => {
    logger.error('[galen-RabbitMQ.close]: ', 'RabbitQM connection closed!');
  });
  return connection;
};

export default createRabbitClient;
