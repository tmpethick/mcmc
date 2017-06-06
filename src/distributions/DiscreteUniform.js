// @flow
import Primitive from './Primitive';
import type { Prob, Integer } from '../types';

export default class DiscreteUniform extends Primitive<Integer> {
  a: Integer;
  b: Integer;

  constructor(a: Integer, b: Integer) {
    super();
    this.a = a;
    this.b = b;
  }

  equals(p1: Primitive<*>): boolean {
    return p1 instanceof DiscreteUniform && this.a === p1.a && this.b === p1.b;
  }

  sample(): Integer {
    return Math.floor(Math.random() * (this.b - this.a + 1) + this.a);
  }

  // eslint-disable-next-line no-unused-vars
  logPdf(x: Integer): Prob {
    return Math.log(this.b - this.a);
  }

  sd(): number {
    const { a, b } = this;
    return Math.sqrt(((a - b + 1) ** 2 - 1) / 12);
  }

  driftKernel(x: Integer): Primitive<Integer> {
    return new DiscreteUniform(x - 2, x + 2);
  }
}
