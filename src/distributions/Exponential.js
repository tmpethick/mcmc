// @flow
import { jStat } from 'jStat';
import Primitive from './Primitive';
import ContinuousDistribution from './ContinuousDistribution';
import type { Prob } from '../types';

export default class Exponential extends ContinuousDistribution {
  rate: number;

  constructor(rate: number) {
    super();
    this.rate = rate;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Exponential && this.rate === p1.rate;
  }

  sample(): number {
    return jStat.exponential.sample(this.rate);
  }

  logPdf(x: number): Prob {
    return Math.log(jStat.exponential.pdf(x, this.rate));
  }

  sd(): number {
    return Math.sqrt(this.rate);
  }
}
