// @flow

import createClient from './client';
import createServer from './server';
import loadConfig from './config';
import createRunner from './runner';
import createLogger from './logger';
import createEnv from './env';

import dotReporter from './reporters/dot';

const logger = createLogger();

async function run() {
  let config;
  let client;
  let server;
  let env;

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

  process.on('SIGINT', () => finish(1));

  try {
    config = await loadConfig();
    logger.debug('Loaded config');

    [client, server] = await Promise.all([createClient(config), createServer(config)]);
    logger.debug('Created client and server');

    env = createEnv({client, server, config, logger});
    logger.debug('Created env');

    server.on('connection', (connection) => {
      logger.debug('Websocket connection established');
      const runner = createRunner(connection, env);
      dotReporter(runner);

      runner.on('end', () => {
        logger.debug('Runner finished');
        finish(0);
      });
    });
  } catch (error) {
    console.error(error);
    await finish(1);
  }
}

run();
