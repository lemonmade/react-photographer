// @flow

import type {Client} from './run/client';
import type {Server} from './run/server';
import type {Logger} from './run/logger';
import type {ConfigType} from './config';

export type EnvType = {
  client: Client,
  server: Server,
  config: ConfigType,
  logger: Logger,
};

export type MessageType = {
  type: string,
  [key: string]: any,
};

export type ViewportType = {
  height: number,
  width: number,
};

export type TestType = {
  name: string,
  component: string,
  groups: string[],
  skip: boolean,
  exclusive: boolean,
  record: boolean,
  viewport: ViewportType,
  hasMultipleViewports: boolean,
  threshold: number,
};

export type SnapshotDescriptorType = TestType & {
  children: React$Element<any>,
  action?: (action: Object) => void | Promise<any>,
};

export type TestResultType = {
  id: string,
  name: string,
  component: string,
  groups: string[],
  skipped: boolean,
  passed: boolean,
  failed: boolean,
  recorded: boolean,
  viewport: ViewportType,
  referenceImage: string,
  compareImage?: string,
  diffImage?: string,
  threshold: number,
  mismatch?: number,
  message?: string,
};
