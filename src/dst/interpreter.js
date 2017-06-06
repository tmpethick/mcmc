// @flow
import R from 'ramda';
import { concat, empty } from 'fantasy-land';
import { constant } from 'fantasy-combinators';
import { Additive } from 'fantasy-monoids';

import {
  Bernoulli,
  Beta,
  Exponential,
  Normal,
  Poisson,
  Uniform,
  DiscreteUniform,
  Primitive,
} from '../distributions';
import RandomMap from '../RandomMap';
import type { ObsModelFType, ModelType, ERPNameType } from './dst';

type LLType = Additive;
type SampleType = any;
type KBType = RandomMap<ERPNameType, [Primitive<*>, SampleType, LLType]>;

const observedSymbol = Symbol('isObserved');
export const isObserved = R.has(observedSymbol);

export function observe<T>(dist: Primitive<T>, obs: T): Primitive<T> {
  return Object.assign({ __proto__: dist.__proto__ }, dist, {
    [observedSymbol]: true,
    sample: () => obs,
    logPdf: () => dist.logPdf(obs),
  });
}

export const dstToDist = (
  obsDist: ObsModelFType,
): [string, Primitive<*>, () => ModelType] => {
  const [dist, obs] = obsDist.cata({
    PureF: dist => [dist],
    ObsF: (dist, obs) => [dist, obs],
  });
  const [name, primitive, next] = dist.cata({
    BernoulliF: (n, p, next_) => [n, new Bernoulli(p), next_],
    BetaF: (n, a, b, next_) => [n, new Beta(a, b), next_],
    NormalF: (n, mu, sigma, next_) => [n, new Normal(mu, sigma), next_],
    UniformF: (n, a, b, next_) => [n, new Uniform(a, b), next_],
    DiscreteUniformF: (n, a, b, next_) => [n, new DiscreteUniform(a, b), next_],
    PoissonF: (n, lambda, next_) => [n, new Poisson(lambda), next_],
    ExponentialF: (n, rate, next_) => [n, new Exponential(rate), next_],
  });
  return [name, !R.isNil(obs) ? observe(primitive, obs) : primitive, next];
};

export function memoizedSampling(
  name: ERPNameType,
  dist: Primitive<*>,
  readKB: KBType,
) {
  const [distDB, x, l] = readKB.get(name, []);
  if (!R.isNil(x) && Primitive.sameType(dist, distDB)) {
    if (dist.equals(distDB)) {
      return [x, l];
    }
    const lnew = dist.logPdf(x);
    return [x, Additive(lnew)];
  }
  const xnew = dist.sample();
  const lnew = dist.logPdf(xnew);
  return [xnew, Additive(lnew)];
}

export const sampleDist = (
  name: ERPNameType,
  dist: Primitive<*>,
  readKB: KBType,
  writeKB: KBType,
  ll: Additive,
) => {
  const [x, l] = memoizedSampling(name, dist, readKB);
  const kb = isObserved(dist) ? writeKB : writeKB.set(name, [dist, x, l]);
  return [x, kb, ll[concat](l)];
};

export const mhInterpret = (model, readKB: KBType) => {
  function loop(model, readKB, writeKB: KBType, ll) {
    return model.resume().fold(
      (x) => {
        const [n, dist, next] = dstToDist(x);
        const [sample, writeKBnew, llnew] = sampleDist(
          n,
          dist,
          readKB,
          writeKB,
          ll,
        );
        // console.log(dist, dist.sample(), llnew);
        return loop(next(sample), readKB, writeKBnew, llnew);
      },
      constant([writeKB, ll]),
    );
  }
  return loop(model, readKB, new RandomMap(), Additive[empty]());
};
