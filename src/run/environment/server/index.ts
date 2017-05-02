import WebSocket, {Server as WebSocketServer} from 'ws';
import {createServer, Server as HTTPServer} from 'http';
import {EventEmitter} from 'events';

import createApp from './app';
import {Workspace} from '../../../workspace';

export default class Server extends EventEmitter {
  private closed = false;
  private httpServer: HTTPServer;
  private webSocketServer: WebSocketServer;

  constructor(workspace: Workspace) {
    super();

    const app = createApp(workspace);

    const httpServer = createServer();
    httpServer.on('request', app);
    httpServer.listen(workspace.config.port, workspace.config.host);

    const webSocketServer = new WebSocketServer({server: httpServer});
    webSocketServer.on('connection', (connection) => this.emit('connection', connection));

    this.httpServer = httpServer;
    this.webSocketServer = webSocketServer;
  }

  on(event: 'connection', handler: (client: WebSocket) => void) {
    return super.on(event, handler);
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.httpServer.close();
  }
}
