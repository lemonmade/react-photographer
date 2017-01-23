import createApp from './app';
import Server from './server';
import Connector from './connector';
import {Workspace} from '../workspace';
import createPhantomClient from './clients/phantom';

export default async function run(workspace: Workspace) {
  const client = await createPhantomClient(workspace);
  const app = createApp(workspace);
  const server = new Server(app, workspace);
  const connector = new Connector(server, client, workspace);



  return true;
}

async function getTests(connector: Connector) {
  const connection = await connector.connect();
  const messagePromise = connection.awaitMessage('TEST_DETAILS');
  connection.send({type: 'SEND_DETAILS'});
  const {tests} = await messagePromise;
  connection.close();
  return tests;
}
