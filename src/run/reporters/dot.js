// @flow

import * as Events from '../events';
import {colorForResult, successColor, errorColor, pendingColor} from '../utilities/color';

const DOT = '.';

export default function dotReporter() {
  // runner.on(Events.end, ({passCount, failCount, skipCount}) => {
  //   console.log('\n');
  //
  //   console.log(successColor(`${passCount} passes`));
  //   console.log(errorColor(`${failCount} failures`));
  //   console.log(pendingColor(`${skipCount} skipped`));
  // });

  return {
    test({result}) {
      const color = colorForResult(result);
      process.stdout.write(color(DOT));
    },

    end() {
      console.log();
    },
  };
}
