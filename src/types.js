import type {Client} from './cli/client';
import type {Server} from './cli/server';
import type {Logger} from './cli/logger';
import type {ConfigType} from './cli/config';

export type EnvType = {
  client: Client,
  server: Server,
  config: ConfigType,
  logger: Logger,
};

export type MessageType = {
  type: string,
  [key: string]: any,
};
