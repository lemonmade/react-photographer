
var React = require('react');
var ReactDOM = require('react-dom');
var SnapshotProvider = snapshotInteropRequire(require('../src/lib/SnapshotProvider'));

var SnapshotComponent0 = snapshotInteropRequire(require('../consumer/components/Badge/Badge.snapshot.js'));
var SnapshotComponent1 = snapshotInteropRequire(require('../consumer/components/Button/Button.snapshot.js'));
var SnapshotComponent2 = snapshotInteropRequire(require('../consumer/components/Word/Word.snapshot.js'));

function snapshotInteropRequire(mod) {
  return mod.__esModule ? mod.default : mod;
}

ReactDOM.render(
React.createElement(SnapshotProvider, {
  tests: [SnapshotComponent0, SnapshotComponent1, SnapshotComponent2]
}),
document.getElementById('root')
);
