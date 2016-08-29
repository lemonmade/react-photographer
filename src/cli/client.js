// @flow

import {create as createPhantom} from 'phantom';

class Client {
  phantom: Object;
  page: Object;

  constructor(phantom, page) {
    this.phantom = phantom;
    this.page = page;
  }

  async open(...args) {
    await this.page.open(...args);
  }

  async set(props) {
    await Promise.all(
      Object
        .keys(props)
        .map((prop) => this.page.property(prop, props[prop]))
    );
  }

  async close() {
    await this.page.close();
    await this.phantom.exit();
  }
}

export default async function createClient() {
  const phantom = await createPhantom();
  const page = await phantom.createPage();
  return new Client(phantom, page);
}
