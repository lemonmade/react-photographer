import {parse} from 'url';
import WebSocket = require('ws');
import Connection from './connection';
import Server from '../server';
import Pool from '../pool';
import {Workspace} from '../../workspace';
import {Client} from '../../types';

export default class Connector {
  pool: Pool<Connection>;

  constructor(private server: Server, private client: Client, private workspace: Workspace) {
    this.pool = new Pool<Connection>(this.createConnection.bind(this), {
      limit: workspace.config.workers,
    });
  }

  connect() {
    return this.pool.get();
  }

  private async createConnection(id: string): Promise<Connection> {
    const {server, client, workspace} = this;

    const socketPromise: Promise<WebSocket> = new Promise((resolve) => {
      server.once('connection', (socket: WebSocket) => {
        const {query = {}} = parse(socket.upgradeReq.url, true);
        if (query.connection !== id) { return; }
        resolve(socket);
      });
    });

    const page = await client.open(`${workspace.url}?connection=${id}`);
    const socket = await socketPromise;
    const connection = new Connection(socket, page);

    connection.on('close', (connection) => this.pool.release(connection));

    return connection;
  }
}
