// @flow

type BaseActionType = {
  type: string,
};

export function app(state: number = 1, {type}: BaseActionType) {
  if (type !== 'INCREMENT') { return state; }
  return state + 1;
}
