import createServer from '@lemonmade/react-universal/lib/server';

import schema from 'data/schema';
import routes from 'sections';
import createStore from 'store';

const store = createStore();

export default createServer({
  schema,
  routes,
  store,
});
