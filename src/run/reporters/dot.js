import * as Events from '../events';
import {colorForTest, successColor, errorColor, pendingColor} from '../utilities/color';

const DOT = '.';

export default function dotReporter(runner) {
  runner.on(Events.end, ({passCount, failCount, skipCount}) => {
    console.log('\n');

    console.log(successColor(`${passCount} passes`));
    console.log(errorColor(`${failCount} failures`));
    console.log(pendingColor(`${skipCount} skipped`));

    // runner
    //   .tests
    //   .filter((test) => test.result.failed)
    //   .forEach(({name, result: {reason}}) => {
    //     console.log();
    //     console.log(chalk.red(`${name} - ${reason}`));
    //   });
  });

  runner.on(Events.test, (test) => {
    const color = colorForTest(test);
    process.stdout.write(color(DOT));
  });
}
