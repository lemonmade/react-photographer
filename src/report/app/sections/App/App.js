// @flow

import React from 'react';
import Relay from 'react-relay';

import List, {ListItem, ListGroup} from 'components/List';
import Header from 'components/Header';
import Badge from 'components/Badge';
import Sidebar from 'components/Sidebar';
import Frame from 'components/Frame';
import Text from 'components/Text';

import './App.scss';

type SnapshotType = {
  id: string,
  name: string,
  component: string,
  skipped: boolean,
  passed: boolean,
  groups: string[],
  hasMultipleViewports: boolean,
  viewport: {
    height: number,
    width: number,
  },
};

type Props = {
  children?: any,
  viewer: {
    snapshots: SnapshotType[],
  },
};

function App({children, viewer: {snapshots}}: Props) {
  const groupedSnapshots = snapshots.reduce((groups, snapshot) => {
    const {component} = snapshot;
    groups[component] = groups[component] || [];
    groups[component].push(snapshot);
    return groups;
  }, {});

  const sidebar = (
    <Sidebar header={<Header />}>
      <List>
        {Object.keys(groupedSnapshots).map((component, index) => {
          const groupDetails = groupedSnapshots[component].reduce((details, snapshot) => {
            const prop = getLabelForSnapshot(snapshot);
            details[prop] = details[prop] || 0;
            details[prop] += 1;
            return details;
          }, {});

          return (
            <ListGroup key={index} title={component} accessory={<Badge status={groupDetails} />}>
              {groupedSnapshots[component].map((snapshot, snapshotIndex) => {
                const {result: {passed, skipped}, name, id, groups, hasMultipleViewports, viewport} = snapshot;
                let status;
                let title;

                if (passed) {
                  status = 'success';
                } else if (!skipped) {
                  status = 'failure';
                }

                if (hasMultipleViewports) {
                  title = <Text>{name}<Text subdued>@{viewport.width}x{viewport.width}</Text></Text>;
                } else {
                  title = name;
                }

                return (
                  <ListItem
                    key={snapshotIndex}
                    link={`/snapshot/${id}`}
                    title={title}
                    subtitle={groups.join('/')}
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
          component
          groups
          hasMultipleViewports
          viewport {
            height
            width
          }
          result {
            skipped
            passed
          }
        }
      }
    `,
  },
});

const Labels = {
  skipped: 'neutral',
  passed: 'success',
  failed: 'failure',
};

function getLabelForSnapshot({result}) {
  if (result.skipped) {
    return Labels.skipped;
  } else if (result.passed) {
    return Labels.passed;
  } else {
    return Labels.failed;
  }
}
