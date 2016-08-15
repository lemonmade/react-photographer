import chai, {expect} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const sandbox = sinon.sandbox.create();

global.expect = expect;
global.sinon = global.sandbox = sandbox;

chai.use(sinonChai);
chai.config.truncateThreshold = 100;

afterEach(() => {
  sandbox.restore();
});
