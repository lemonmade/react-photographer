// @flow

import React from 'react';
import styles from './Badge.scss';
import {css, variation} from '../../utilities/styles';

type Props = {
  children?: any,
  status?: 'success' | 'failure',
};

export default function Badge(props: Props) {
  const {children} = props;

  return (
    <div className={classNameForBadge(props)}>
      {children}
    </div>
  );
}

function classNameForBadge({status}) {
  return css([
    styles.Badge,
    status && styles[variation('status', status)],
  ]);
}
