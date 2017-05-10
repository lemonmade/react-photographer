import * as React from 'react';
import Snapshot from 'react-photographer';
import Badge from '../Badge';
/*
<SnapshotMatrix
  props={{
    status: ['success', 'info', 'attention', 'warning'],
    progress: ['incomplete', 'partiallyComplete', 'complete'],
  }}
  render={(props) => <Badge {...props}>Badge</Badge>}
/>*/

export default function BadgeSnapshots() {
  return (
    <Snapshot component={Badge}>
      <Snapshot name="base">
        <Snapshot name="base">
          <Badge>Hello</Badge>
        </Snapshot>

        <Snapshot name="progress">
          <Snapshot name="incomplete">
            <Badge progress="incomplete">Hello</Badge>
          </Snapshot>

          <Snapshot name="complete">
            <Badge progress="complete">Hello</Badge>
          </Snapshot>

          <Snapshot name="partiallyComplete">
            <Badge progress="partiallyComplete">Hello</Badge>
          </Snapshot>
        </Snapshot>
      </Snapshot>

      <Snapshot name="success">
        <Snapshot name="base">
          <Badge status="success">Hello</Badge>
        </Snapshot>

        <Snapshot name="progress">
          <Snapshot name="incomplete">
            <Badge status="success" progress="incomplete">Hello</Badge>
          </Snapshot>

          <Snapshot name="complete">
            <Badge status="success" progress="complete">Hello</Badge>
          </Snapshot>

          <Snapshot name="partiallyComplete">
            <Badge status="success" progress="partiallyComplete">Hello</Badge>
          </Snapshot>
        </Snapshot>
      </Snapshot>

      <Snapshot name="info">
        <Snapshot name="base">
          <Badge status="info">Hello</Badge>
        </Snapshot>

        <Snapshot name="progress">
          <Snapshot name="incomplete">
            <Badge status="info" progress="incomplete">Hello</Badge>
          </Snapshot>

          <Snapshot name="complete">
            <Badge status="info" progress="complete">Hello</Badge>
          </Snapshot>

          <Snapshot name="partiallyComplete">
            <Badge status="info" progress="partiallyComplete">Hello</Badge>
          </Snapshot>
        </Snapshot>
      </Snapshot>

      <Snapshot name="attention">
        <Snapshot name="base">
          <Badge status="attention">Hello</Badge>
        </Snapshot>

        <Snapshot name="progress">
          <Snapshot name="incomplete">
            <Badge status="attention" progress="incomplete">Hello</Badge>
          </Snapshot>

          <Snapshot name="complete">
            <Badge status="attention" progress="complete">Hello</Badge>
          </Snapshot>

          <Snapshot name="partiallyComplete">
            <Badge status="attention" progress="partiallyComplete">Hello</Badge>
          </Snapshot>
        </Snapshot>
      </Snapshot>

      <Snapshot name="warning">
        <Snapshot name="base">
          <Badge status="warning">Hello</Badge>
        </Snapshot>

        <Snapshot name="progress">
          <Snapshot name="incomplete">
            <Badge status="warning" progress="incomplete">Hello</Badge>
          </Snapshot>

          <Snapshot name="complete">
            <Badge status="warning" progress="complete">Hello</Badge>
          </Snapshot>

          <Snapshot name="partiallyComplete">
            <Badge status="warning" progress="partiallyComplete">Hello</Badge>
          </Snapshot>
        </Snapshot>
      </Snapshot>
    </Snapshot>
  );
}
