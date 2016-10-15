import fs from 'fs-extra';
import path from 'path';
import getImageSize from 'image-size';

import compareFiles from '../utilities/compare';
import {debug} from '../utilities/console';
import {Rect} from '../../utilities/geometry';

const actionHandlers = {
  async hover({position}, {client}) {
    const center = new Rect(position).center;
    await client.mouse.move(center);
  },

  async mousedown({position}, {client}) {
    const center = new Rect(position).center;
    await client.mouse.down(center);
  },
};

export default async function run(test, {config, server}) {
  const {id, threshold, record, skip} = test;

  const result = {
    id,
    passed: !skip && !record,
    failed: !skip && record,
    skipped: skip,
    recorded: record,
    mismatch: 0,
    duration: 0,
    threshold,
    reason: null,
    details: null,
    image: null,
    diff: null,
  };

  if (skip) { return result; }

  const paths = getPathsForTest(test, config);
  if (!record && !fileExists(paths.reference)) {
    result.passed = false;
    result.failed = true;
    result.reason = 'Missing reference snapshot';
    return result;
  }

  const connection = await server.connect();
  debug(`Started running test: ${JSON.stringify(test)}`);

  let duration = 0;
  const start = Date.now();

  const {client} = connection;
  await client.set({viewportSize: test.viewport});
  debug(`Set viewport for ${id} to ${JSON.stringify(test.viewport)}`);

  await client.mouse.move({x: 10000, y: 10000});
  await client.mouse.up();

  connection.send({type: 'RUN_TEST', test: id});

  while (true) {
    // TODO: async iterator
    const message = await connection.awaitMessage();
    const {type} = message;

    if (type === 'READY_FOR_MY_CLOSEUP') {
      const {position} = message;
      debug(`Requested snapshot for: ${id}, at position ${JSON.stringify(position)}`);

      fs.mkdirpSync(path.dirname(record ? paths.reference : paths.compare));
      await client.snapshot({
        output: record ? paths.reference : paths.compare,
        clip: position,
      });
      const imageSize = getImageSize(record ? paths.reference : paths.compare);

      const newImage = {
        src: path.relative(path.dirname(config.snapshotRoot), paths.reference),
        height: imageSize.height,
        width: imageSize.width,
      };

      if (record) {
        result.image = newImage;
      }

      duration += (Date.now() - start);

      break;
    } else if (type === 'REQUEST_ACTION') {
      debug(`Received action request: ${message.action}, ${id}`);

      const {action} = message;
      const handler = actionHandlers[action];

      // TODO: handle unavailable actions
      if (typeof handler === 'function') {
        await handler(message, connection);
      }

      connection.send({type: 'PERFORMED_ACTION', action: message.action, id});
    }
  }

  connection.release();

  if (!record) {
    const compareStart = Date.now();
    const comparisonResult = await compareFiles(paths.compare, paths.reference);
    const passed = (comparisonResult.misMatchPercentage <= threshold);
    fs.mkdirpSync(path.dirname(paths.diff));
    await writeComparisonToFile(comparisonResult, paths.diff);

    result.mismatch = comparisonResult.misMatchPercentage;
    result.passed = passed;
    result.failed = !passed;

    const imageSize = getImageSize(paths.compare);
    result.image = {
      src: path.relative(path.dirname(config.snapshotRoot), paths.compare),
      height: imageSize.height,
      width: imageSize.width,
    };

    const diffImageSize = getImageSize(paths.diff);
    result.diff = {
      src: path.relative(path.dirname(config.snapshotRoot), paths.diff),
      height: diffImageSize.height,
      width: diffImageSize.width,
    };

    duration += (compareStart - Date.now());
  }

  result.duration = duration;
  return result;
}

function getPathsForTest({viewport, component, name, groups}, {snapshotRoot}) {
  const viewportString = `@${viewport.width}x${viewport.height}`;
  const snapshotPath = path.join(component, ...groups);
  return {
    reference: path.join(snapshotRoot, 'reference', snapshotPath, `${name}${viewportString}.reference.png`),
    compare: path.join(snapshotRoot, 'compare', snapshotPath, `${name}${viewportString}.compare.png`),
    diff: path.join(snapshotRoot, 'diff', snapshotPath, `${name}${viewportString}.diff.png`),
  };
}

function fileExists(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
}

async function writeComparisonToFile(comparison, file) {
  await new Promise((resolve) => {
    const writeStream = fs.createWriteStream(file);
    writeStream.on('close', resolve);

    comparison
      .getDiffImage()
      .pack()
      .pipe(writeStream);
  });
}
