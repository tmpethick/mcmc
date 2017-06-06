// @flow
import Primitive from './Primitive';

export default class ContinuousDistribution extends Primitive<number> {
  driftKernel(x: number): Primitive<number> {
    // Use require to circumvent circular dependency.
    // eslint-disable-next-line global-require
    const Normal = require('./Normal').default;
    return new Normal(x, this.sd() / 5);
  }
}
