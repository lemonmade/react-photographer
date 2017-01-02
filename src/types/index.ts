export {ID} from '../id';
export {Config} from '../workspace';

export interface Viewport {
  width: number,
  height: number,
}

export interface Action {
  (): void,
}

type Primitive = string | number | boolean;
type Serializable = Primitive | Primitive[] | {[key: string]: Serializable};

export interface Message {
  type: string,
  [key: string]: Serializable,
}

export interface Listener {
  stop(): void,
}

export interface Messenger {
  send(message: Message): void,
  listen(handler: (message: Message) => void): Listener,
}
