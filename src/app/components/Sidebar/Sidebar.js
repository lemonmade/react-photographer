// @flow

import React from 'react';
import styles from './Sidebar.scss';

type Props = {
  children?: any,
  header: React.Element,
};

export default function Sidebar({children, header}: Props) {
  return (
    <div className={styles.Sidebar}>
      <div className={styles.Header}>
        {header}
      </div>
      <div className={styles.Content}>
        {children}
      </div>
    </div>
  );
}
