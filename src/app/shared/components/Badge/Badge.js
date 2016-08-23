// @flow

import React from 'react';
import styles from './Badge.scss';
import {css, variation} from '../../utilities/styles';

type StatusType = 'success' | 'failure' | 'neutral';

type SplitStatusType = {
  [key: StatusType]: number,
};

type Props = {
  status?: StatusType | SplitStatusType,
};

export default function Badge({status}: Props) {
  if (status == null || typeof status === 'string') {
    return <div className={classNameForBadge({status})} />;
  }

  return (
    <div className={styles.Badge}>
      {Object.keys(status).map((key) => {
        return (
          <div
            key={key}
            className={classNameForBadgeSegment({status: key})}
          >
            {status[key]}
          </div>
        );
      })}
    </div>
  );
}

function classNameForBadgeSegment({status}) {
  return css([
    styles.Segment,
    status && styles[variation('status', status)],
  ]);
}

function classNameForBadge({status}) {
  return css([
    styles.Badge,
    status && styles[variation('status', status)],
  ]);
}
