// @flow

import React from 'react';
import Relay from 'react-relay';

import OnionSkin from 'components/OnionSkin';

type Props = {
  snapshot: {
    id: string,
    referenceImage: string,
    compareImage: string,
    passed: boolean,
  },
};

function Snapshot({snapshot: {id, image, result: {image: resultImage, passed}}}: Props) {
  const component = passed
    ? <img src={`/${image.src}`} alt="Reference snapshot" />
    : <OnionSkin
      comparisonImage={`/${resultImage.src}`}
      referenceImage={`/${image.src}`}
      />;

  return (
    <div>
      <h1>{id} ({passed ? 'passed' : 'failed'})</h1>
      {component}
    </div>
  );
}

export default Relay.createContainer(Snapshot, {
  fragments: {
    snapshot: () => Relay.QL`
      fragment on Snapshot {
        id
        image {src}
        result {
          passed
          image {src}
          diff {src}
        }
      }
    `,
  },
});
