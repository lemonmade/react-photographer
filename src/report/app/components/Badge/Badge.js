// @flow

import React from 'react';
import {css, variation} from 'utilities/styles';
import styles from './Badge.scss';

const Statuses = {
  success: 'success',
  failure: 'failure',
  neutral: 'neutral',
};

type StatusType = $Keys<typeof Statuses>;

const statusMap: {[key: string]: ?StatusType} = Statuses;

type SplitStatusType = {
  [key: StatusType]: number,
};

type Props = {
  status?: StatusType | SplitStatusType,
};

export default function Badge({status}: Props) {
  if (typeof status === 'object') {
    return (
      <div className={styles.Badge}>
        {Object.keys(status).map((key) => {
          if (statusMap[key]) {
            return (
              <div
                key={key}
                className={classNameForBadgeSegment({status: key})}
              >
                {/* $FlowIssue: flow doesn't like it, but it's fine */}
                {status[key]}
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  }

  return <div className={classNameForBadge({status})} />;
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
