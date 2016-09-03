// @flow

import yargs from 'yargs';

import createClient, {Client} from './client';
import createServer, {Server} from './server';
import loadConfig from './config';
import type {ConfigType} from './config';
import createRunner from './runner';
import createLogger from './logger';
import type {EnvType} from '../types';

import * as Events from './events';
import dotReporter from './reporters/dot';

const argv = yargs.argv;
const logger = createLogger({verbose: Boolean(argv.verbose)});

async function run() {
  let config: ConfigType;
  let client: Client;
  let server: Server;
  let env: EnvType;

  async function finish(code) {
    if (client) {
      await client.close();
      logger.debug('Closed client');
    }

    if (server) {
      await server.close();
      logger.debug('Closed server');
    }

    process.exit(code);
  }

  process.on('SIGINT', async () => await finish(1));

  process.on('uncaughtException', async (error) => {
    logger.error(error);
    await finish(1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.log('\n');
    logger.error(reason);
    await finish(1);
  });

  try {
    config = await loadConfig();
    logger.debug('Loaded config');

    [client, server] = await Promise.all([createClient(config), createServer(config)]);
    logger.debug('Created client and server');

    env = {client, server, config, logger};
    logger.debug('Created env');

    client.on('onConsoleMessage', (arg) => logger.debug(arg));
    client.on('onError', (arg) => logger.debug(arg));

    await client.connectToServer(server);
    logger.debug('Connected to server');

    const runner = createRunner(env);
    dotReporter(runner);

    runner.on(Events.end, () => {
      logger.debug('Runner finished');
      finish(0);
    });
  } catch (error) {
    console.error(error);
    await finish(1);
  }
}

run();
