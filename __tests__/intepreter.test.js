// @flow
import seedrandom from 'seedrandom';
import { Additive } from 'fantasy-monoids';
import { identity } from 'fantasy-combinators';

import { bern, beta, BernoulliF, PureF } from '../src/dst/dst';
import {
  mhInterpret,
  memoizedSampling,
  sampleDist,
  dstToDist,
  observe,
} from '../src/dst/interpreter';
import Bernoulli from '../src/distributions/Bernoulli';
import Normal from '../src/distributions/Normal';
import RandomMap from '../src/RandomMap';
import type { KB } from '../src/dst/interpreter';

import { Dirac } from './Primitive.test';

describe('interpreter', () => {
  describe('dstToDist', () => {
    test('simpleDst', () => {
      let [n, dist, next] = dstToDist(PureF(BernoulliF('b', 0.6, identity)));
      expect(n).toEqual('b');
      expect(dist).toEqual(new Bernoulli(0.6));
      expect(next).toEqual(identity);
    });
  });

  describe('observe', () => {
    test('observed', () => {
      const observed = observe(new Dirac(1), 5);
      expect(observed.sample()).toEqual(5);
      expect(observed.logPdf(1)).toEqual(Math.log(0));
      expect(observed.logPdf(5)).toEqual(Math.log(0));
    });
  });

  describe('memoizedSampling', () => {
    test('no change', () => {
      const kb: KB = new RandomMap().set('a', [
        new Normal(0, 1),
        0.5,
        Additive(1),
      ]);
      const [sample, l] = memoizedSampling('a', new Normal(0, 1), kb);
      expect(sample).toEqual(0.5);
      expect(l).toEqual(Additive(1));
    });
    test('new point', () => {
      const kb = new RandomMap();
      const [sample, l] = memoizedSampling('a', new Normal(0, 1), kb);
    });
    test('new params', () => {
      const newDist = new Normal(10, 2);
      const kb = new RandomMap().set('a', [new Normal(0, 1), 0.5, Additive(1)]);
      const [sample, l] = memoizedSampling('a', newDist, kb);
      expect(sample).toEqual(0.5);
      expect(l).not.toEqual(newDist.logPdf(sample));
    });
  });

  describe('sampleDist', () => {
    test('no changesd', () => {
      const name = 'a';
      const dist = new Normal(0, 1);
      const readKB: KB = new RandomMap().set('a', [
        new Normal(0, 1),
        0.5,
        Additive(1),
      ]);
      const writeKB = new RandomMap();
      const ll = Additive(5);
      const [x, newWriteKB, newll] = sampleDist(
        name,
        dist,
        readKB,
        writeKB,
        ll,
      );
      expect(newll).toEqual(Additive(6));

      const [newDist, newx, newl] = newWriteKB.get(name);
      expect(newl).toEqual(Additive(1));
      expect(newx).toEqual(0.5);
    });
  });

  test('mhInterpret', () => {
    seedrandom(1, { global: true });
    const model = bern('a', 1).chain(a => beta('b', 1, 2));
    const kb: KB = new RandomMap().set('a', [
      new Bernoulli(1),
      false,
      Additive(1),
    ]);
    const [writeKB, ll] = mhInterpret(model, kb);
    // console.log(writeKB);
    expect(ll.x).toBeCloseTo(1.336);
  });
});
