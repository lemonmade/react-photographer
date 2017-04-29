import {EventEmitter} from 'events';
import WebSocket = require('ws');
import {Messenger, Listener, Message, Page} from '../../types';

export default class Connection extends EventEmitter {
  private messenger: Messenger;

  constructor(public socket: WebSocket, public page: Page) {
    super();
    this.messenger = new SocketMessenger(socket);
  }

  on(event: 'close', handler: (connection: this) => void) {
    super.on(event, handler);
    return this;
  }

  send(message: Message) {
    this.messenger.send(message);
  }

  awaitMessage(type: string): Promise<Message> {
    const {messenger} = this;

    return new Promise((resolve) => {
      const listener = messenger.listen((message) => {
        if (message.type !== type) { return; }
        listener.stop();
        resolve(message);
      });
    });
  }

  close() {
    this.emit('close', this);
  }
}

class SocketMessenger implements Messenger {
  constructor(private socket: WebSocket) {}

  listen(callback: (message: Message) => void): Listener {
    const {socket} = this;

    function listener(data: string) {
      const message = JSON.parse(data);
      if (message.photographer) {
        callback(message as Message);
      }
    }

    socket.on('message', listener);

    return {
      stop() {
        socket.removeListener('message', listener);
      },
    };
  }

  send(message: Message) {
    this.socket.send(JSON.stringify({
      photographer: true,
      ...message,
    }));
  }
}
