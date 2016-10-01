// @flow

import report from '../../../report';
import loadConfig from '../../../config';

export const command = 'report';
export const describe = 'Open a report for the last snapshot test';
export const builder = {};

export async function handler() {
  const config = await loadConfig();
  report(config);
}
