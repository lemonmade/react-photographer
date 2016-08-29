import {EventEmitter} from 'events';

class Connection extends EventEmitter {}

class Server extends EventEmitter {
  constructor(...args) {
    super(...args);
    setTimeout(() => this.emit('connection', new Connection()), 1000);
  }

  async close() {}
}

export default function server() {
  return new Server();
}
