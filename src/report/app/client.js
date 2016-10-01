import createClientRenderer from '@lemonmade/react-universal/lib/client';

import initialRoutes from 'sections';
import createStore from 'store';

const store = createStore();
const renderApp = createClientRenderer({store});

renderApp(initialRoutes);

// The following is needed so that we can hot reload our App.
if (module.hot) {
  module.hot.accept('./client.js');
  module.hot.accept('sections/index.js', () => {
    const newRoutes = require('sections/index.js').default;

    renderApp(newRoutes);
  });
}
