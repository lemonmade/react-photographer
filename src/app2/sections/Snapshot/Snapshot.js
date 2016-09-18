// @flow

import React from 'react';
import Relay from 'react-relay';

import Swipe from '../../components/Swipe';
import OnionSkin from '../../components/OnionSkin';

function Snapshot({snapshot: {id, referenceImage, compareImage, passed}}) {
  const component = passed
    ? <img src={`/${referenceImage}`} alt="Reference" />
    : (
      <OnionSkin
        comparisonImage={`/${compareImage}`}
        referenceImage={`/${referenceImage}`}
      />
    );

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
        passed
        referenceImage
        compareImage
        diffImage
      }
    `,
  },
});
