import * as React from 'react';
import Snapshot from 'react-photographer';
import Banner from '../Banner';

import '../../../styles/global.scss';

export default function BannerSnapshots() {
  return (
    <Snapshot component={Banner}>
      <Snapshot name="base">
        <Banner>This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="action">
        <Banner action={{content: 'An action'}}>This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="secondary-action">
        <Banner action={{content: 'An action'}} secondaryAction={{content: 'Another action'}}>This is some banner content.</Banner>
      </Snapshot>

      <Snapshot
        name="dismissible"
        cases={[
          {name: 'focus', action: (actions) => actions.mousedown(document.querySelector('button'))},
        ]}
      >
        <Banner onDismiss={() => {}}>This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="success">
        <Banner status="success">This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="info">
        <Banner status="info">This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="warning">
        <Banner status="warning">This is some banner content.</Banner>
      </Snapshot>

      <Snapshot name="critical">
        <Banner status="critical">This is some banner content.</Banner>
      </Snapshot>
    </Snapshot>
  );
}
