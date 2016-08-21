import Relay from 'react-relay';

export const ViewerQuery = {
  viewer: () => Relay.QL`
    query { viewer }
  `,
};
