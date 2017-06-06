// @flow
import { jStat } from 'jStat';

import ContinuousDistribution from './ContinuousDistribution';
import Primitive from './Primitive';
import type { Prob } from '../types';

export default class Beta extends ContinuousDistribution {
  a: number;
  b: number;

  constructor(a: number, b: number) {
    super();
    this.a = a;
    this.b = b;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Beta && this.a === p1.a && this.b === p1.b;
  }

  sample(): number {
    return jStat.beta.sample(this.a, this.b);
  }

  logPdf(x: number): Prob {
    return Math.log(jStat.beta.pdf(x, this.a, this.b));
  }

  sd(): number {
    return Math.sqrt(jStat.beta.variance(this.a, this.b));
  }
}
