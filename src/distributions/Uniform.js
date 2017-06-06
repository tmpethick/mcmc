// @flow
import Primitive from './Primitive';
import ContinuousDistribution from './ContinuousDistribution';
import type { Prob } from '../types';

export default class Uniform extends ContinuousDistribution {
  a: number;
  b: number;

  constructor(a: number, b: number) {
    super();
    this.a = a;
    this.b = b;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof Uniform && this.a === p1.a && this.b === p1.b;
  }

  sample(): number {
    return Math.random() * (this.b - this.a) + this.a;
  }

  // eslint-disable-next-line no-unused-vars
  logPdf(x: number): Prob {
    return Math.log(this.b - this.a);
  }

  sd(): number {
    const { a, b } = this;
    return Math.sqrt((a - b) ** 2 / 12);
  }
}
