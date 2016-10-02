// @flow

import React from 'react';
import styles from './List.scss';

type Props = {
  children?: any,
};

export default function List({children}: Props) {
  return (
    <ul className={styles.List}>
      {children}
    </ul>
  );
}
