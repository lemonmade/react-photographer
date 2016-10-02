// @flow

import * as Events from '../events';
import {colorForTest, successColor, errorColor, pendingColor} from '../utilities/color';
import type {Runner} from '../runner';

const DOT = '.';

export default function dotReporter(runner: Runner) {
  runner.on(Events.end, ({passCount, failCount, skipCount}) => {
    console.log('\n');

    console.log(successColor(`${passCount} passes`));
    console.log(errorColor(`${failCount} failures`));
    console.log(pendingColor(`${skipCount} skipped`));
  });

  runner.on(Events.test, (test) => {
    const color = colorForTest(test);
    process.stdout.write(color(DOT));
  });
}
