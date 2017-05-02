import {EventEmitter} from 'events';
import WebSocket = require('ws');
import {Message, Client} from '../../../types';
import Messenger from './messenger';

export default class Connection extends EventEmitter {
  private messenger: Messenger;

  constructor(
    public socket: WebSocket,
    public client: Client,
  ) {
    super();
    this.messenger = new Messenger(socket);
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
