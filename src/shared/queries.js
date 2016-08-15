import Relay from 'react-relay';

export const UserQuery = {
  user: () => Relay.QL`
    query { user }
  `,
};
