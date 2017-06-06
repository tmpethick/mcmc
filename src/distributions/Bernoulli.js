// @flow
import Primitive from './Primitive';
import type { Prob } from '../types';

export default class Bernoulli extends Primitive<boolean> {
  p: Prob;

  constructor(p: Prob) {
    super();
    this.p = p;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Bernoulli && this.p === p1.p;
  }

  sample(): boolean {
    return Math.random() < this.p;
  }

  // TODO: pmf for discrete
  logPdf(x: boolean): Prob {
    return Math.log(x ? this.p : 1 - this.p);
  }

  sd(): number {
    return Math.sqrt(this.p * (1 - this.p));
  }
}
