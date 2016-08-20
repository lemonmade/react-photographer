// @flow

import React from 'react';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';
import Router from 'react-router/lib/Router';
import browserHistory from 'react-router/lib/browserHistory';
import match from 'react-router/lib/match';

import routes from '../shared/routes';
import createStore from '../shared/store';

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql'));
const data = window.APP_STATE;

IsomorphicRelay.injectPreparedData(environment, data);

// Get the DOM Element that will host our React application.
const container = document.querySelector('#app');

function renderApp() {
  // As we are using dynamic react-router routes we have to use the following
  // asynchronous routing mechanism supported by the `match` function.
  // @see https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md
  match({history: browserHistory, routes}, (error, redirectLocation, renderProps) => {
    if (error) {
      console.log('==> 😭  React Router match failed.'); // eslint-disable-line no-console
    }

    IsomorphicRouter
      .prepareInitialRender(environment, renderProps)
      .then((props) => {
        const store = createStore();

        return render(
          <AppContainer>
            <Provider store={store}>
              <Router {...props} />
            </Provider>
          </AppContainer>,
          container
        );
      });
  });
}

// The following is needed so that we can hot reload our App.
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
  module.hot.accept('../shared/routes', renderApp);
}

renderApp();
