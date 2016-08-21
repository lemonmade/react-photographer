// @flow

import React, {Children} from 'react';
import styles from './List.scss';

type Props = {
  children?: any,
};

export default function List({children}: Props) {
  return (
    <ul className={styles.List}>
      {Children.map(children, (child, index) => {
        return <li className={styles.Item} key={index}>{child}</li>;
      })}
    </ul>
  );
}
