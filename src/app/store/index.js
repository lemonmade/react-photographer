// @flow

import {createStore, combineReducers} from 'redux';
import {identity} from 'utilities/other';

import * as reducers from './reducers';

export default function createEnhancedStore(initialState: Object = {}) {
  const store = createStore(
    combineReducers(reducers),
    initialState,
    (typeof window === 'object' && window.devToolsExtension) ? window.devToolsExtension() : identity
  );

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const newReducers = require('./reducers');

      store.replaceReducer(combineReducers(newReducers));
    });
  }

  return store;
}
