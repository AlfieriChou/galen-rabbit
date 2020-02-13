import { createLogger, stdSerializers } from 'bunyan';
import * as RotatingFileStream from 'bunyan-rotating-file-stream';

const createBunyanLogger = (logPath: string) => createLogger({
  name: 'galen-rabbit',
  streams: [
    {
      stream: new RotatingFileStream({
        path: logPath,
        period: '1d',
        totalFiles: 10,
        rotateExisting: true,
        threshold: '10m',
        totalSize: '20m',
        gzip: true,
      }),
    },
  ],
  serializers: stdSerializers,
});

export default createBunyanLogger;
