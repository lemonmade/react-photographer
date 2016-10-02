// @flow

import React from 'react';

import styles from './List.scss';

type Props = {
  children?: any,
  accessory?: React$Element<*>,
};

export default function Layout({children, accessory}: Props) {
  if (accessory != null) {
    return (
      <div className={styles.Layout}>
        <div className={styles.Content}>{children}</div>
        <div className={styles.Accessory}>{accessory}</div>
      </div>
    );
  }

  return <div>{children}</div>;
}
