export interface Message {
  type: string,
  [key: string]: any,
}

export interface Listener {
  stop(): void,
}

export interface Messenger {
  send(message: Message): void,
  listen(handler: (message: Message) => void): Listener,
}
