// @flow
import Primitive from '../src/distributions/Primitive';
import type { Prob } from '../src/types';

// eslint-disable-next-line import/prefer-default-export
export class Dirac extends Primitive<number> {
  x: number;
  constructor(x: number) {
    super();
    this.x = x;
  }
  sample(): number {
    return this.x;
  }
  logPdf(x: number): Prob {
    return Math.log(x === this.x ? 1 : 0);
  }
}

describe('Primitive', () => {
  const simple = new Dirac(1).flatMap(u1 => new Dirac(u1 + 2));

  test('one', () => {
    expect(new Dirac(2).logPdf(1)).toEqual(Math.log(0));
    expect(new Dirac(1).logPdf(1)).toEqual(Math.log(1));
  });

  test('flatMapped', () => {
    expect(simple.sample()).toEqual(3);
  });
});
