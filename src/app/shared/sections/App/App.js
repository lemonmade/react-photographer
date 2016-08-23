// @flow

import React from 'react';
import Relay from 'react-relay';

import List, {ListItem, ListGroup} from '../../components/List';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import Sidebar from '../../components/Sidebar';
import Frame from '../../components/Frame';

import '../../components/index.scss';

type Props = {
  children?: any,
};

function App({children, viewer: {snapshots}}: Props) {
  const groupedSnapshots = snapshots.reduce((groups, snapshot) => {
    const component = snapshot.stack[0];
    groups[component] = groups[component] || [];
    groups[component].push(snapshot);
    return groups;
  }, {});

  const sidebar = (
    <Sidebar header={<Header />}>
      <List>
        {Object.keys(groupedSnapshots).map((component, index) => {
          const groupDetails = groupedSnapshots[component].reduce((details, snapshot) => {
            const prop = snapshot.skip ? 'neutral' : (snapshot.passed ? 'success' : 'failure');
            details[prop] = details[prop] || 0;
            details[prop] += 1;
            return details;
          }, {});

          return (
            <ListGroup key={index} title={component} accessory={<Badge status={groupDetails} />}>
              {groupedSnapshots[component].map((snapshot, snapshotIndex) => {
                const {passed, skip, name, id} = snapshot;
                let status;

                if (passed) {
                  status = 'success';
                } else if (!skip) {
                  status = 'failure';
                }

                return (
                  <ListItem
                    key={snapshotIndex}
                    link={`/snapshot/${id}`}
                    title={name}
                    accessory={<Badge status={status} />}
                  />
                );
              })}
            </ListGroup>
          );
        })}
      </List>
    </Sidebar>
  );

  return (
    <Frame sidebar={sidebar} header={<Header />}>
      {children}
    </Frame>
  );
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        snapshots {
          id
          name
          skip
          passed
          stack
        }
      }
    `,
  },
});
