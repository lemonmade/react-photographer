// @flow

import React from 'react';
import styles from './ListResult.scss';

import Stack from '../../../../components/Stack';

type Props = {
  children?: any,
  name: string,
  stack: string[],
  badge?: React.Element,
};

export default function ListResult({name, stack, badge}: Props) {
  return (
    <div className={styles.ListResult}>
      <Stack alignment="center">
        <Stack.Item fill>
          <div className={styles.MetaText}>{stack.join('/')}</div>
          <div className={styles.Title}>{name}</div>
        </Stack.Item>
        {badge}
      </Stack>
    </div>
  );
}
