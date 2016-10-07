// @flow

import React, {isValidElement, Children} from 'react';
import {render, unmountComponentAtNode} from 'react-dom';

export function wrapWithComponent(element: ?React$Element, Component: React$Component, props?: Object) {
  if (element == null) { return element; }
  return isElementOfType(element, Component)
    ? element
    : <Component {...props}>{element}</Component>;
}

export function isElementOfType(element: ?React$Element, Components: React$Component | React$Component[]) {
  if (element == null || !isValidElement(element)) { return false; }

  const stringifiedComponent = element.type.toString();
  const componentArray = Array.isArray(Components) ? Components : [Components];

  return componentArray.find((Component) => Component.toString() === stringifiedComponent) != null;
}

export function elementChildren(
  children: mixed,
  predicate: (() => boolean) = () => true
): React$Element[] {
  return Children.toArray(children).filter((child) => isValidElement(child) && predicate(child));
}

export function augmentComponent(
  Component: React$Component,
  methods: {[key: string]: Function}
): React$Component {
  for (const [name, method] of Object.entries(methods)) {
    if (typeof method !== 'function') { continue; }

    const currentMethod = Component.prototype[name];

    Component.prototype[name] = function(...args) {
      if (typeof currentMethod === 'function') { currentMethod.apply(this, ...args); }
      method.call(this, ...args);
    };
  }

  return Component;
}

let layerIndex = 1;
export function layeredComponent({idPrefix = 'Layer'}: {idPrefix?: string}) {
  function uniqueID() {
    return `${idPrefix}${layerIndex++}`;
  }

  return function createLayeredComponent(Component: React$Component) {
    return augmentComponent(Component, {
      componentWillMount() {
        const node = document.createElement('div');
        node.id = uniqueID();
        this.layerNode = node;
      },

      componentDidMount() {
        document.body.appendChild(this.layerNode);
        this.renderLayerToNode();
      },

      componentDidUpdate() {
        this.renderLayerToNode();
      },

      renderLayerToNode() {
        render(this.renderLayer(), this.layerNode);
      },

      componentWillUnmount() {
        const {layerNode} = this;
        const {parent} = layerNode;

        unmountComponentAtNode(layerNode);
        if (parent) { parent.removeChild(layerNode); }
      },
    });
  };
}
