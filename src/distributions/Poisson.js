// @flow
import { jStat } from 'jStat';
import Primitive from './Primitive';
import type { Prob, Integer } from '../types';

export default class Poisson extends Primitive<Integer> {
  lambda: number;

  constructor(lambda: number) {
    super();
    this.lambda = lambda;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Poisson && this.lambda === p1.lambda;
  }

  sample(): Integer {
    return jStat.poisson.sample(this.lambda);
  }

  logPdf(x: Integer): Prob {
    return Math.log(jStat.poisson.pdf(x, this.lambda));
  }

  sd() {
    return Math.sqrt(this.lambda);
  }

  /* eslint-disable no-unused-vars */
  driftKernel(x: Integer): Primitive<*> {
    return this;
  }
}
