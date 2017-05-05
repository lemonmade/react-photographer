import * as React from 'react';

import {ID} from '../../types';
import Snapshot, {Props} from '../Snapshot';
import {Descriptor, SnapshotSource} from '../types';

interface NestedDescriptor {
  groups: Descriptor['groups'],
  record: Descriptor['record'],
  skip: Descriptor['skip'],
  only: Descriptor['only'],
  threshold: Descriptor['threshold'],
  viewports: Descriptor['viewport'][],
}

interface Config {
  record: Descriptor['record'],
  threshold: Descriptor['threshold'],
  viewports: Descriptor['viewport'][],
}

export default function getDescriptorsFromSource(
  source: SnapshotSource,
  config: Config,
): Descriptor[] {
  const element = getElementFromSource(source);

  const initialDescriptor: NestedDescriptor = {
    ...config,
    skip: false,
    only: false,
    groups: [],
  };

  return getDescriptorsFromElement(element, initialDescriptor);
}

function getDescriptorsFromElement(
  element: React.ReactElement<any>,
  nestedDescriptor: NestedDescriptor,
): Descriptor[] {
  if (!elementIsSnapshot(element)) {
    return [];
  }

  const {component, name, children, action, cases, record, skip, only, viewports, viewport, threshold} = element.props;
  let allViewports: Descriptor['viewport'][];

  if (viewport) {
    allViewports = [viewport];
  } else if (viewports) {
    allViewports = viewports;
  } else {
    allViewports = nestedDescriptor.viewports;
  }

  const hasMultipleViewports = (allViewports.length > 1);

  const finalName = (
    (typeof component === 'string' && component) ||
    (component != null && ((component as React.ComponentClass<any>).displayName || (component as React.StatelessComponent<any>).name)) ||
    name
  ) as string;

  const newNestedDescriptor: NestedDescriptor = {
    groups: nestedDescriptor.groups,
    record: record == null ? nestedDescriptor.record : record,
    skip: skip == null ? nestedDescriptor.skip : skip,
    only: only == null ? nestedDescriptor.only : only,
    threshold: threshold == null ? nestedDescriptor.threshold : threshold,
    viewports: allViewports || nestedDescriptor.viewports,
  };

  if (allChildrenAreSnapshots(element)) {
    newNestedDescriptor.groups.push(finalName);
    const nestedDescriptors: Descriptor[] = [];

    React.Children.forEach(children, (child: React.ReactChild) => {
      if (!React.isValidElement(child)) { return; }
      nestedDescriptors.push(...getDescriptorsFromElement(child, newNestedDescriptor));
      return true;
    });

    return nestedDescriptors;
  }

  if (cases == null) {
    return allViewports.map((viewport) => ({
      id: getID({name: finalName, case: null, groups: newNestedDescriptor.groups, viewport}),
      name: finalName,
      case: null,
      action: action || null,
      element: children,
      groups: newNestedDescriptor.groups,
      record: newNestedDescriptor.record,
      skip: newNestedDescriptor.skip,
      only: newNestedDescriptor.only,
      threshold: newNestedDescriptor.threshold,
      viewport,
      hasMultipleViewports,
    }));
  }

  return allViewports.reduce<Descriptor[]>((allSnapshots, viewport) => [
    ...allSnapshots,
    {
      id: getID({name: finalName, case: null, groups: newNestedDescriptor.groups, viewport}),
      name: finalName,
      case: null,
      action: null,
      element: children,
      groups: newNestedDescriptor.groups,
      record: newNestedDescriptor.record,
      skip: newNestedDescriptor.skip,
      only: newNestedDescriptor.only,
      threshold: newNestedDescriptor.threshold,
      viewport,
      hasMultipleViewports,
    },
    ...cases.map(({name: caseName, action: caseAction}) => ({
      id: getID({name: finalName, case: caseName, groups: newNestedDescriptor.groups, viewport}),
      name: finalName,
      case: caseName,
      action: caseAction || null,
      element: children,
      groups: newNestedDescriptor.groups,
      record: newNestedDescriptor.record,
      skip: newNestedDescriptor.skip,
      only: newNestedDescriptor.only,
      threshold: newNestedDescriptor.threshold,
      viewport,
      hasMultipleViewports,
    }))
  ], []);
}

interface IDOptions {
  name: Descriptor['name'],
  case: Descriptor['case'],
  groups: Descriptor['groups'],
  viewport: Descriptor['viewport'],
}

function getID({name, case: caseName, groups, viewport}: IDOptions): ID {
  return `${groups.join('-')}-${name}${caseName ? `-${caseName}` : ''}@${viewport.width}x${viewport.height}`;
}

function getElementFromSource(source: SnapshotSource): React.ReactElement<any> {
  const sourceAsComponentClass = (source as React.ComponentClass<any>);

  if (sourceAsComponentClass.prototype && sourceAsComponentClass.prototype.render) {
    return (new sourceAsComponentClass()).render() as React.ReactElement<any>;
  } else if (typeof source === 'function') {
    return (source as React.StatelessComponent<any>)({});
  } else {
    throw new Error('TODO');
  }
}

function elementIsSnapshot(element: React.ReactChild): element is React.ReactElement<Props> {
  return ((element as React.ReactElement<any>).type === Snapshot);
}

function allChildrenAreSnapshots(element: React.ReactElement<any>) {
  if (React.Children.count(element.props.children) === 0) { return false; }

  let allSnapshots = true;

  React.Children.forEach(element.props.children, (child) => {
    allSnapshots = (
      allSnapshots &&
      (child != null) &&
      elementIsSnapshot(child)
    );
  });

  return allSnapshots;
}
