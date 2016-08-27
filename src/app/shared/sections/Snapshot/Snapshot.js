import React from 'react';
import Relay from 'react-relay';

function Snapshot({snapshot: {id, referenceImage, compareImage, diffImage}}) {
  return (
    <div>
      <h1>{id}!</h1>
      <img src={`/${referenceImage}`} alt="reference"></img>
      <img src={`/${compareImage}`} alt="compare"></img>
      <img src={`/${diffImage}`} alt="diff"></img>
    </div>
  );
}

export default Relay.createContainer(Snapshot, {
  fragments: {
    snapshot: () => Relay.QL`
      fragment on Snapshot {
        id
        referenceImage
        compareImage
        diffImage
      }
    `,
  },
});
