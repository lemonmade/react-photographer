import {Client} from './browser';
import {Messenger, Message} from '../../types';

export class Connection {
  constructor(
    private messenger: Messenger,
    private client: Client,
    private handleRelease: (obj: Connection) => void,
  ) {}

  send(message: Message) {
    this.messenger.send(message);
  }

  release() {
    this.handleRelease(this);
  }

  awaitMessage(type: string) {

  }
}
