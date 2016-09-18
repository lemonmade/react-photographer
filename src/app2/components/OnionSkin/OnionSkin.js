// @flow

import React, {Component} from 'react';
import styles from './OnionSkin.scss';
import {css} from '../../utilities/styles';

type Props = {
  comparisonImage: string,
  referenceImage: string,
};

type State = {
  referenceOpacity: number,
};

export default class OnionSkin extends Component {
  props: Props;
  state: State = {referenceOpacity: 0};
  handleOpacityChange: (event: Object) => void = this.handleOpacityChange.bind(this);

  handleOpacityChange({target: {value}}: Object) {
    this.setState({referenceOpacity: value / 100});
  }

  render() {
    const {comparisonImage, referenceImage} = this.props;
    const {referenceOpacity} = this.state;

    return (
      <div className={styles.OnionSkin}>
        <div className={styles.ImageContainer}>
          <div className={styles.Image}>
            <img src={comparisonImage} alt="Comparison" />
          </div>

          <div
            className={css([styles.Image, styles.reference])}
            style={{opacity: referenceOpacity}}
          >
            <img src={referenceImage} alt="Reference" />
          </div>
        </div>
        <input
          type="range"
          value={referenceOpacity * 100}
          onChange={this.handleOpacityChange}
        />
      </div>
    );
  }
}
