// @flow

import React, {Component} from 'react';
import {css} from 'utilities/styles';
import styles from './Swipe.scss';

type State = {
  proportionRevealed: number,
};

type Props = {
  comparisonImage: string,
  referenceImage: string,
};

export default class Swipe extends Component {
  setImageContainer: (imageContainer: HTMLElement) => void = this.setImageContainer.bind(this);
  handleMouseMove: (event: Object) => void = this.handleMouseMove.bind(this);
  imageContainer: HTMLElement;

  props: Props;
  state: State = {
    proportionRevealed: 0,
  };

  setImageContainer(imageContainer: HTMLElement) {
    this.imageContainer = imageContainer;
  }

  handleMouseMove(event: Object) {
    const {clientX} = event;
    const {imageContainer} = this;
    const distanceFromEdge = clientX - imageContainer.offsetLeft;
    const imageContainerWidth = imageContainer.offsetWidth;

    this.setState({
      proportionRevealed: Math.max(0, Math.min(1, distanceFromEdge / imageContainerWidth)),
    });
  }

  render() {
    const {comparisonImage, referenceImage} = this.props;
    const {proportionRevealed} = this.state;
    const proportionAsPercentage = `${proportionRevealed * 100}%`;

    return (
      <div className={styles.Swipe} onMouseMove={this.handleMouseMove}>
        <div
          className={styles.ImageContainer}
          ref={this.setImageContainer}
        >
          <div className={styles.Image}>
            <img src={comparisonImage} alt="comparison snapshot" />
          </div>

          <div
            className={css([styles.Image, styles.reference])}
            style={{width: proportionAsPercentage}}
          >
            <img src={referenceImage} alt="reference snapshot" />
          </div>

          <SwipeBar position={proportionRevealed} />
        </div>
      </div>
    );
  }
}

type SwipeBarProps = {
  position: number,
};

function SwipeBar({position}: SwipeBarProps) {
  return (
    <div
      className={styles.Bar}
      style={{left: position * 100}}
    />
  );
}
