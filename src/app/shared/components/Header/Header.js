// @flow

import React from 'react';
import styles from './Header.scss';

type Props = {
  children?: any,
};

export default function Header({children}: Props) {
  return (
    <div className={styles.Header}>
      {children}
    </div>
  );
}
