// @flow

import Relay from 'react-relay';

export const ViewerQuery = {
  viewer: () => Relay.QL`
    query { viewer }
  `,
};

export const SnapshotQuery = {
  snapshot: () => Relay.QL`
    query { snapshot(id: $id) }
  `,
};
