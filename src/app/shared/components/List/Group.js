// @flow

import React, {Children} from 'react';
import styles from './List.scss';

type Props = {
  children?: any,
  title: string,
  accessory?: React.Element,
};

export default function ListGroup({children, title, accessory}: Props) {
  return (
    <li className={styles.Group}>
      <div className={styles.GroupTitle}>
        {title}
        {accessory}
      </div>
      <ul className={styles.GroupList}>
        {children}
      </ul>
    </li>
  );
}
