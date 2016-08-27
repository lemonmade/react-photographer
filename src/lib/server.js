import http from 'http';
import {Server as WebSocketServer} from 'ws';
import {create as createPhantom} from 'phantom';

class Server {
  constructor({httpServer, phantom, socketServer}) {
    this.httpServer = httpServer;
    this.phantom = phantom;
    this.socketServer = socketServer;
    this.pages = [];
    this.listeners = {};
    this.messageHandlers = [];

    socketServer.on('connection', (socket) => {
      this.socket = socket;
      console.log('connected to websocket');

      socket.on('message', (msg) => {
        if (typeof this.listeners.message === 'function') {
          this.listeners.message(JSON.parse(msg));
        }
      });
    });
  }

  on(event, listener) {
    this.listeners[event] = listener;
  }

  async initializePage() {
    const page = await this.phantom.createPage();

    await page.property('onError', (msg, trace) => {
      console.error(msg, trace);
    });

    await page.property('onConsoleMessage', (msg) => {
      console.log(msg);
    });

    this.page = page;
  }

  use(app) {
    this.httpServer.on('request', app);
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }

  async close() {
    this.httpServer.close();
    await this.page.close();
    await this.phantom.exit();
  }
}

export default async function server() {
  const httpServer = http.createServer();
  const socketServer = new WebSocketServer({server: httpServer});
  const [phantom] = await Promise.all([
    createPhantom(),
    new Promise((resolve) => {
      httpServer.listen(3000, () => {
        console.log('listening on port 3000');
        resolve();
      });
    }),
  ]);

  const instance = new Server({httpServer, phantom, socketServer});
  await instance.initializePage();
  return instance;
}
