// @flow

import React from 'react';
import Relay from 'react-relay';
import styles from './App.scss';

import List from '../../components/List';
import Badge from '../../components/Badge';
import Stack from '../../components/Stack';
import ListResult from './components/ListResult';

import '../../components/index.scss';

type Props = {
  children?: any,
};

function App({children, viewer: {snapshots}}: Props) {
  return (
    <div className={styles.Home}>
      <div className={styles.Sidebar}>
        <List>
          {snapshots.map((snapshot, index) => {
            const {mismatch} = snapshot;
            const badge = <ListBadge snapshot={snapshot} />;
            const accessory = (
              <Stack vertical spacing="none" alignment="center">
                {badge}
                {mismatch < 0.001 ? null : <span className={styles.Mismatch}>{mismatch * 100}%</span>}
              </Stack>
            );

            return (
              <ListResult
                key={index}
                snapshot={snapshot}
                badge={accessory}
              />
            );
          })}
        </List>
      </div>

      <div className={styles.Content}>
        {children}
      </div>
    </div>
  );
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        snapshots {
          name
          stack
          passed
          skip
          mismatch
          ${ListResult.getFragment('snapshot')}
        }
      }
    `,
  },
});

function ListBadge({snapshot: {passed, skip}}) {
  let status;
  let text = 'skipped';

  if (passed) {
    status = 'success';
    text = 'passed';
  } else if (!skip) {
    status = 'failure';
    text = 'failed';
  }

  return <Badge status={status}>{text}</Badge>;
}
