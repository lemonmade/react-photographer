import * as React from 'react';

export type AnyComponent<P, S> = (
  React.StatelessComponent<P> |
  React.ClassType<P, React.Component<P, S>, React.ComponentClass<P>>
);
