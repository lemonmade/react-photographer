class Env {
  constructor({client, server, config, logger}) {
    this.client = client;
    this.server = server;
    this.config = config;
    this.logger = logger;
  }
}

export default function env(...args) {
  return new Env(...args);
}
