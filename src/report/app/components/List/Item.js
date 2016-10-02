// @flow
/* eslint react/forbid-component-props: off */

import React from 'react';
import Link from 'react-router/lib/Link';

import styles from './List.scss';
import Layout from './Layout';

type Props = {
  children?: any,
  link?: string,
  title: any,
  subtitle?: string,
  accessory?: React$Element<*>,
};

export default function ListItem({title, link, accessory, subtitle}: Props) {
  const contents = (
    <Layout accessory={accessory}>
      {subtitle && <div className={styles.Subtitle}>{subtitle}</div>}
      <div className={styles.Title}>{title}</div>
    </Layout>
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
