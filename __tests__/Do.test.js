// @flow
import seedrandom from 'seedrandom';

import Uniform from '../src/distributions/Uniform';
import { Pure } from '../src/distributions/Primitive';
import Do from '../src/Do';

describe('Do', () => {
  test('behave like flatMap equivalent', () => {
    // This should be equivalent:
    const con1 = Do(function* () {
      const a = (yield new Uniform(1, 10)) +
        (yield new Uniform(1, 10)) +
        (yield new Uniform(1, 10));
      return new Uniform(a, a * a);
    });

    // ... To this:
    const con2 = new Uniform(1, 10).flatMap(u1 =>
      new Uniform(1, 10).flatMap(u2 =>
        new Uniform(1, 10).flatMap((u3) => {
          const a = u1 + u2 + u3;
          return new Uniform(a, a * a);
        })));

    seedrandom(1, { global: true });
    const arr1 = con1.sample();
    seedrandom(1, { global: true });
    const arr2 = con2.sample();
    expect(arr1).toEqual(arr2);
  });

  test('with Pure', () => {
    seedrandom(1, { global: true });
    const con = Do(function* () {
      const a = yield new Uniform(1, 10);
      const b = yield new Uniform(1, 10);
      const c = yield new Uniform(1, 10);
      return new Pure({ a, b, c });
    });
    expect(con.sample()).toEqual(
      expect.objectContaining({
        a: expect.any(Number),
        b: expect.any(Number),
        c: expect.any(Number),
      }),
    );
  });
});
