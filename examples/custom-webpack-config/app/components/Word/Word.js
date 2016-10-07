// @flow

import React from 'react';

type Props = {
  children?: any,
};

export default function Word(props: Props) {
  return (
    <div style={{fontSize: '3rem'}}>{props.children}</div>
  );
}
