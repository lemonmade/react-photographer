// @flow

import yargs from 'yargs';

import createClient, {Client} from './client';
import createServer, {Server} from './server';
import type {ConfigType} from '../config';
import createRunner from './runner';
import createLogger from './logger';

import * as Events from './events';
import dotReporter from './reporters/dot';

export default async function run(config: ConfigType) {
  let client: Client;
  let server: Server;

  const argv = yargs.argv;
  const logger = createLogger({verbose: Boolean(argv.verbose)});

  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  function cleanup() {
    if (client) {
      client.close();
      logger.debug('Closed client');
    }

    if (server) {
      server.close();
      logger.debug('Closed server');
    }
  }

  return await (async () => {
    [client, server] = await Promise.all([createClient(config), createServer(config)]);
    logger.debug('Created client and server');

    const env = {client, server, config, logger};
    logger.debug('Created env');

    client.on('onConsoleMessage', (arg) => logger.debug(arg));
    client.on('onError', (arg) => logger.debug(arg));

    await client.connectToServer(server);
    logger.debug('Connected to server');

    const runner = createRunner(env);
    dotReporter(runner);

    await new Promise((resolve) => {
      runner.on(Events.end, () => {
        logger.debug('Runner finished');
        resolve();
      });
    });

    cleanup();
    return runner;
  })();
}
