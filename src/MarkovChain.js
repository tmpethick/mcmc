// @flow
import { Additive } from 'fantasy-monoids';
import { empty, concat } from 'fantasy-land';

import Sampler from './Sampler';
import RandomMap from './RandomMap';
import { mhInterpret } from './dst/interpreter';
import Average from './monoid/average';

export default class MarkovChain<T, O, M> extends Sampler {
  constructor(
    init: (model: M) => T,
    transition: (t: T) => T,
    transform: (T) => O,
    model: M,
  ) {
    super(
      (function* () {
        let x = init(model);
        yield transform(x);
        while (true) {
          x = transition(x);
          yield transform(x);
        }
      }()),
    );
  }
}

const runMonoid = m => m.x;

export const metropolisHastings = {
  init(model) {
    let [kb, ll] = mhInterpret(model, new RandomMap());
    return [model, kb, ll, Average[empty]()];
  },

  transition([model, kb, ll, accepts]) {
    const name = kb.getRandomName();
    const [dist, x, l] = kb.get(name);
    const kernelx = dist.driftKernel(x);
    const x0 = kernelx.sample();
    const kernelx0 = dist.driftKernel(x0);
    const R = kernelx0.logPdf(x);
    const F = kernelx.logPdf(x0);
    const l0 = dist.logPdf(x0);
    const kb0 = kb.set(name, [dist, x0, Additive(l0)]);
    const [kb1, ll0] = mhInterpret(model, kb0);
    const accept = runMonoid(ll0) - runMonoid(ll) + R - F;
    // Always accept if `accept` is NaN before ll was `Infinity`.
    if (Math.log(Math.random()) < (accept || 0)) {
      return [model, kb1, ll0, accepts[concat](new Average(1))];
    }
    return [model, kb, ll, accepts[concat](new Average(0))];
  },

  transform([model, kb, ll, accepts]) {
    // TODO: only works for discrete using Integers and continuous distributions.
    return kb.getMap().map(([dist, sample, v]) => sample);
  },
};

export function markovChainMetropolisHastings(model) {
  const { init, transition, transform } = metropolisHastings;
  return new MarkovChain(init, transition, transform, model);
}
