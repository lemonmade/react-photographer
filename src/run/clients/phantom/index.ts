import {create as createPhantom, PhantomJS} from 'phantom';
import Page from './page';
import {Client, ClientCreator} from '../../../types';

export class Phantom implements Client {
  private closed = false;

  constructor(private phantom: PhantomJS) {}

  async open(url: string) {
    const page = await this.phantom.createPage();
    await page.property('onConsoleMessage', function () { console.log.apply(console, arguments) });
    await page.property('onResourceError', function (error) { console.log(JSON.stringify(error)) });
    await page.open(url);
    return new Page(page);
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
} as ClientCreator);
