// @flow

import React, {Children} from 'react';
import styles from './List.scss';
import Layout from './Layout';

type Props = {
  children?: any,
  title: string,
  accessory?: React.Element,
};

export default function ListGroup({children, title, accessory}: Props) {
  return (
    <li className={styles.Group}>
      <div className={styles.GroupTitle}>
        <Layout accessory={accessory}>{title}</Layout>
      </div>
      <ul className={styles.GroupList}>
        {children}
      </ul>
    </li>
  );
}
