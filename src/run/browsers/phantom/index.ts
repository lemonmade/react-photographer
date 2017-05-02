import {create as createPhantom, PhantomJS} from 'phantom';
import {Browser, BrowserCreator} from '../../../types';
import createClient from './client';

export class Phantom implements Browser {
  private closed = false;

  constructor(private phantom: PhantomJS) {}

  async open(url: string) {
    const client = await createClient(this.phantom);
    await client.navigate(url);
    return client;
  }

  close() {
    if (this.closed) { return; }

    this.closed = true;
    this.phantom.exit();
  }
}

export default (async function createClient() {
  const phantom = await createPhantom();
  return new Phantom(phantom);
} as BrowserCreator);
