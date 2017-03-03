import * as React from 'react';

import Snapshot from '../Snapshot';
import {Descriptor} from '../types';
import getTestDescriptorsFromSource from '../get-descriptors';

describe('getTestDescriptorsFromSource()', () => {
  const viewport = {height: 200, width: 200};
  const config = {record: false, threshold: 0.1, viewports: [viewport]};
  const buttonElement = <Button />;
  const basicTestDescriptor: Descriptor = {
    id: `Button-base@${viewport.width}x${viewport.height}`,
    groups: ['Button'],
    name: 'base',
    case: null,
    action: null,
    element: buttonElement,
    record: false,
    skip: false,
    only: false,
    threshold: 0.1,
    viewport,
    hasMultipleViewports: false,
  };

  function Button(_: {primary?: boolean}) { return <button>Button</button>; }

  function getBasicTestElement() {
    return (
      <Snapshot component={Button}>
        <Snapshot name="base">
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );
  }

  it('works for functional components', () => {
    const ButtonTest = () => getBasicTestElement();
    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([basicTestDescriptor]);
  });

  it('works for class-based components', () => {
    class ButtonTest extends React.Component<{}, {}> {
      render() { return getBasicTestElement(); }
    }

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([basicTestDescriptor]);
  });

  it('works for pure components', () => {
    class ButtonTest extends React.PureComponent<{}, {}> {
      render() { return getBasicTestElement(); }
    }

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([basicTestDescriptor]);
  });

  it('works for React.createClass components', () => {
    const ButtonTest = React.createClass({
      render() {
        return getBasicTestElement();
      }
    })

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([basicTestDescriptor]);
  });

  it('returns a result for multiple nested snapshots', () => {
    const primaryButtonElement = <Button primary>Primary button</Button>;
    const ButtonTest = () => (
      <Snapshot component={Button}>
        <Snapshot name="base">
          {buttonElement}
        </Snapshot>

        <Snapshot name="primary">
          {primaryButtonElement}
        </Snapshot>
      </Snapshot>
    );

    const primaryDescriptor: Descriptor = {
      ...basicTestDescriptor,
      id: `Button-primary@${viewport.width}x${viewport.height}`,
      name: 'primary',
      element: primaryButtonElement,
    };

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([
      basicTestDescriptor,
      primaryDescriptor,
    ]);
  });

  it('returns a result for each viewport', () => {
    const viewportOne = {height: 200, width: 200};
    const viewportTwo = {height: 300, width: 300};

    const ButtonTest = () => (
      <Snapshot component={Button}>
        <Snapshot name="base" viewports={[viewportOne, viewportTwo]}>
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([
      {
        ...basicTestDescriptor,
        id: `Button-base@${viewportOne.width}x${viewportOne.height}`,
        viewport: viewportOne,
        hasMultipleViewports: true,
    },
      {
        ...basicTestDescriptor,
        id: `Button-base@${viewportTwo.width}x${viewportTwo.height}`,
        viewport: viewportTwo,
        hasMultipleViewports: true,
      },
    ]);
  });

  it('uses the declared viewport over the config', () => {
    const alternateViewport = {height: viewport.height + 1, width: viewport.width + 1};

    const ButtonTest = () => (
      <Snapshot component={Button} viewport={alternateViewport}>
        <Snapshot name="base">
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      id: `Button-base@${alternateViewport.width}x${alternateViewport.height}`,
      viewport: alternateViewport,
    });
  });

  it('uses the most nested declared viewport', () => {
    const componentViewport = {height: viewport.height + 1, width: viewport.width + 1};
    const nestedViewport = {height: viewport.height - 1, width: viewport.width - 1};

    const ButtonTest = () => (
      <Snapshot component={Button} viewport={componentViewport}>
        <Snapshot name="base" viewport={nestedViewport}>
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      id: `Button-base@${nestedViewport.width}x${nestedViewport.height}`,
      viewport: nestedViewport,
    });
  });

  it('uses the declared record over the config', () => {
    const ButtonTest = () => (
      <Snapshot component={Button} record={!config.record}>
        <Snapshot name="base">
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      record: !config.record,
    });
  });

  it('uses the most nested declared record', () => {
    const ButtonTest = () => (
      <Snapshot component={Button} record={!config.record}>
        <Snapshot name="base" record={config.record}>
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      record: config.record,
    });
  });

  it('uses the declared threshold over the config', () => {
    const ButtonTest = () => (
      <Snapshot component={Button} threshold={config.threshold + 0.25}>
        <Snapshot name="base">
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      threshold: config.threshold + 0.25,
    });
  });

  it('uses the most nested declared threshold', () => {
    const ButtonTest = () => (
      <Snapshot component={Button} threshold={config.threshold + 0.25}>
        <Snapshot name="base" threshold={config.threshold + 0.5}>
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      threshold: config.threshold + 0.5,
    });
  });

  it('uses a supplied action', () => {
    const action = () => {};
    const ButtonTest = () => (
      <Snapshot component={Button}>
        <Snapshot name="base" action={action}>
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)[0]).toEqual({
      ...basicTestDescriptor,
      action,
    });
  });

  it('creates a snapshot for each case', () => {
    const caseOne = 'base';
    const caseTwo = 'hover';
    const actionOne = () => {};
    const actionTwo = () => {};

    const ButtonTest = () => (
      <Snapshot component={Button}>
        <Snapshot
          name="base"
          cases={[
            {name: caseOne, action: actionOne},
            {name: caseTwo, action: actionTwo},
          ]}
        >
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseOne}@${viewport.width}x${viewport.height}`,
        case: caseOne,
        action: actionOne,
      },
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseTwo}@${viewport.width}x${viewport.height}`,
        case: caseTwo,
        action: actionTwo,
      },
    ]);
  });

  it('creates a snapshot for each case and viewport', () => {
    const caseOne = 'base';
    const caseTwo = 'hover';
    const actionOne = () => {};
    const viewportOne = {height: 200, width: 200};
    const viewportTwo = {height: 300, width: 300};

    const ButtonTest = () => (
      <Snapshot component={Button} viewports={[viewportOne, viewportTwo]}>
        <Snapshot
          name="base"
          cases={[
            {name: caseOne, action: actionOne},
            {name: caseTwo},
          ]}
        >
          {buttonElement}
        </Snapshot>
      </Snapshot>
    );

    expect(getTestDescriptorsFromSource(ButtonTest, config)).toEqual([
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseOne}@${viewportOne.width}x${viewportOne.height}`,
        case: caseOne,
        action: actionOne,
        viewport: viewportOne,
        hasMultipleViewports: true,
      },
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseTwo}@${viewportOne.width}x${viewportOne.height}`,
        case: caseTwo,
        viewport: viewportOne,
        hasMultipleViewports: true,
      },
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseOne}@${viewportTwo.width}x${viewportTwo.height}`,
        case: caseOne,
        action: actionOne,
        viewport: viewportTwo,
        hasMultipleViewports: true,
      },
      {
        ...basicTestDescriptor,
        id: `Button-base-${caseTwo}@${viewportTwo.width}x${viewportTwo.height}`,
        case: caseTwo,
        viewport: viewportTwo,
        hasMultipleViewports: true,
      },
    ]);
  });
});
