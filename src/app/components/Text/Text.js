// @flow

import React from 'react';
import {css} from 'utilities/styles';
import styles from './Text.scss';

type Props = {
  children?: any,
  subdued?: boolean,
};

export default function Text(props: Props) {
  const {children} = props;

  return (
    <span className={classNameForText(props)}>
      {children}
    </span>
  );
}

function classNameForText({subdued}) {
  return css([
    styles.Text,
    subdued && styles.subdued,
  ]);
}
