// @flow
import { jStat } from 'jStat';

import Primitive from './Primitive';
import ContinuousDistribution from './ContinuousDistribution';
import type { Prob } from '../types';

export default class Normal extends ContinuousDistribution {
  mu: number;
  sigma: number;

  constructor(mu: number, sigma: number) {
    super();
    this.mu = mu;
    this.sigma = sigma;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Normal && this.mu === p1.mu && this.sigma === p1.sigma;
  }

  sample(): number {
    return jStat.normal.sample(this.mu, this.sigma);
  }

  logPdf(x: number): Prob {
    return Math.log(jStat.normal.pdf(x, this.mu, this.sigma));
  }

  sd(): number {
    return this.sigma;
  }
}
