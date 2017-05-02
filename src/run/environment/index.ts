import {parse} from 'url';
import WebSocket = require('ws');

import Connection from './connection';
import Server from './server';

import Pool from '../../utilities/pool';
import {Workspace} from '../../workspace';
import {Browser, BrowserCreator} from '../../types';

export class Environment {
  pool: Pool<Connection>;

  constructor(private server: Server, private browser: Browser, private workspace: Workspace) {
    this.pool = new Pool<Connection>(this.createConnection.bind(this), {
      limit: workspace.config.workers,
    });
  }

  connect() {
    return this.pool.get();
  }

  close() {
    this.server.close();
    this.browser.close();
  }

  private async createConnection(id: string): Promise<Connection> {
    const {server, browser, workspace} = this;

    const socketPromise = new Promise<WebSocket>((resolve) => {
      function handleConnection(socket: WebSocket) {
        const {query = {}} = parse(socket.upgradeReq.url as string, true);
        if (String(query.connection) !== String(id)) { return; }

        server.removeListener('connection', handleConnection);
        resolve(socket);
      }

      server.on('connection', handleConnection);
    });

    const client = await browser.open(`${workspace.url}?connection=${id}`);
    const socket = await socketPromise;
    const connection = new Connection(socket, client);

    connection.on('close', (connection) => this.pool.release(connection));

    return connection;
  }
}

export default async function createEnvironment(
  workspace: Workspace,
  createBrowser: BrowserCreator,
) {
  const browser = await createBrowser(workspace);
  const server = new Server(workspace);
  const environment = new Environment(server, browser, workspace);

  const cleanup = environment.close.bind(environment);
  process.on('SIGINT', cleanup);
  process.on('uncaughtException', cleanup);
  process.on('unhandledRejection', cleanup);

  return environment;
}
