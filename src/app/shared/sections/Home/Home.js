// @flow

import React from 'react';
import Relay from 'react-relay';

import styles from './Home.scss';

function Home({viewer}) {
  const {snapshots} = viewer;
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

const HomeContainer = Relay.createContainer(Home, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        snapshots {
          passed
          skip
        }
      }
    `,
  },
});

export default HomeContainer;