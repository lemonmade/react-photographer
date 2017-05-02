import WebSocket = require('ws');
import {Messenger, Listener, Message} from '../../../types';

export default class SocketMessenger implements Messenger {
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
