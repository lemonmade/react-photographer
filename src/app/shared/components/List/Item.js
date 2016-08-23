// @flow

import React from 'react';
import Link from 'react-router/lib/Link';

import styles from './List.scss';

type Props = {
  children?: any,
  link?: string,
  title: string,
  accessory?: React.Element,
};

export default function ListItem({title, link, accessory}: Props) {
  const contents = (
    <div className={styles.Content}>
      <div className={styles.Title}>
        {title}
      </div>

      {accessory}
    </div>
  );

  if (link) {
    return (
      <li className={styles.Item}>
        <Link className={styles.ContentWrapper} to={link}>
          {contents}
        </Link>
      </li>
    );
  }

  return (
    <li className={styles.Item}>
      <div className={styles.ContentWrapper}>
        {contents}
      </div>
    </li>
  );
}
