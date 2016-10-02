// @flow

import React from 'react';
import styles from './Frame.scss';

type Props = {
  children?: any,
  sidebar: React$Element<*>,
  header: React$Element<*>,
};

export default function Frame({children, sidebar, header}: Props) {
  return (
    <div className={styles.Frame}>
      <div className={styles.Sidebar}>
        {sidebar}
      </div>

      <div className={styles.Main}>
        <div className={styles.Header}>
          {header}
        </div>

        <div className={styles.Content}>
          {children}
        </div>
      </div>
    </div>
  );
}
