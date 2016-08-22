// @flow

import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';
import styles from './ListResult.scss';

import Stack from '../../../../components/Stack';

type Props = {
  children?: any,
  name: string,
  stack: string[],
  badge?: React.Element,
};

function ListResult({snapshot: {id, name, stack}, badge}: Props) {
  return (
    <Link to={`/snapshot/${id}`} className={styles.ListResult}>
      <Stack alignment="center">
        <Stack.Item fill>
          <div className={styles.MetaText}>{stack.join('/')}</div>
          <div className={styles.Title}>{name}</div>
        </Stack.Item>
        {badge}
      </Stack>
    </Link>
  );
}

export default Relay.createContainer(ListResult, {
  fragments: {
    snapshot: () => Relay.QL`
      fragment on Snapshot {
        id
        name
        stack
      }
    `,
  },
});
