// @flow

import React from 'react';
import Relay from 'react-relay';

import styles from './Home.scss';

import List from '../../components/List';
import Stack from '../../components/Stack';
import Badge from '../../components/Badge';
import ListResult from './components/ListResult';

function Home({viewer}) {
  const {snapshots} = viewer;

  return (
    <div className={styles.Home}>
      <div className={styles.Sidebar}>
        <List>
          {snapshots.map((snapshot, index) => {
            const {name, stack, mismatch} = snapshot;
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
                name={name}
                stack={stack}
                badge={accessory}
              />
            );
          })}
        </List>
      </div>

      <div className={styles.Content}>
        <Summary viewer={viewer} />
      </div>
    </div>
  );
}

function Summary({viewer: {snapshots}}) {
  const {passes, skips, failures} = snapshots.reduce((all, snapshot) => {
    if (snapshot.skip) {
      all.skips += 1;
    } else if (snapshot.passed) {
      all.passes += 1;
    } else {
      all.failures += 1;
    }

    return all;
  }, {passes: 0, skips: 0, failures: 0});

  return (
    <div className={styles.Summary}>
      <div className={styles.SummaryItem}>
        <div className={styles.Number}>{passes}</div> passes
      </div>

      <div className={styles.SummaryItem}>
        <div className={styles.Number}>{failures}</div> failures
      </div>

      <div className={styles.SummaryItem}>
        <div className={styles.Number}>{skips}</div> skipped
      </div>
    </div>
  );
}

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


const HomeContainer = Relay.createContainer(Home, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        snapshots {
          name
          stack
          passed
          skip
          mismatch
        }
      }
    `,
  },
});

export default HomeContainer;
