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

function Snapshot({snapshot: {id, referenceImage, compareImage, passed}}: Props) {
  const component = passed
    ? <img src={`/${referenceImage}`} alt="Reference snapshot" />
    : <OnionSkin
      comparisonImage={`/${compareImage}`}
      referenceImage={`/${referenceImage}`}
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
        passed
        referenceImage
        compareImage
        diffImage
      }
    `,
  },
});
