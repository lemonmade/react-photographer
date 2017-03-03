import {createNodeWithPosition} from './utilities';

import Actions from '../actions';
import {getCenterForNode} from '../utilities';

import {Messenger, Message, Listener} from '../../types';

interface Callback {
  (message: Message): Listener,
}

class MockMessenger implements Messenger {
  callbacks = new Set<Callback>();

  get hasListeners() {
    return this.callbacks.size > 0;
  }

  send = jest.fn();
  listen = jest.fn((callback: Callback) => {
    this.callbacks.add(callback);
    return {
      stop: () => {
        this.callbacks.delete(callback);
      },
    };
  });

  trigger(message: Message) {
    this.callbacks.forEach((callback) => {
      callback(message);
    });
  }
}

describe('Actions', () => {
  let messenger: MockMessenger;
  let node: HTMLElement;
  let actions: Actions;

  beforeEach(() => {
    node = createNodeWithPosition({
      x: 100,
      y: 200,
      height: 400,
      width: 800,
    });
    messenger = new MockMessenger();
    actions = new Actions(node, messenger);
  });

  describe('#node', () => {
    it('exposes the node', () => {
      expect(actions.node).toBe(node);
    });
  });

  describe('#hover()', () => {
    it('listens for a single mouseover event and then removes the listener', async () => {
      const hoverPromise = actions.hover();
      expect(messenger.send).toHaveBeenCalledWith({
        type: 'REQUEST_ACTION',
        action: 'mouseover',
        position: getCenterForNode(node),
      });

      messenger.trigger({
        type: 'PERFORMED_ACTION',
        action: 'mousedown',
      });

      expect(messenger.hasListeners).toBe(true);

      messenger.trigger({
        type: 'PERFORMED_ACTION',
        action: 'mouseover',
      });

      await hoverPromise;

      expect(messenger.hasListeners).toBe(false);
    });
  });

  describe('#mousedown()', () => {
    it('listens for a mousedown event and then removes the listener', async () => {
      const mousedownPromise = actions.mousedown();
      expect(messenger.send).toHaveBeenCalledWith({
        type: 'REQUEST_ACTION',
        action: 'mousedown',
        position: getCenterForNode(node),
      });

      messenger.trigger({
        type: 'PERFORMED_ACTION',
        action: 'mouseup',
      });

      expect(messenger.hasListeners).toBe(true);

      messenger.trigger({
        type: 'PERFORMED_ACTION',
        action: 'mousedown',
      });

      await mousedownPromise;

      expect(messenger.hasListeners).toBe(false);
    });
  });
});
