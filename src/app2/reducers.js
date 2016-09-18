import {INCREMENT} from './types';

export function app(state = 1, {type}) {
  if (type !== INCREMENT) { return state; }
  return state + 1;
}
