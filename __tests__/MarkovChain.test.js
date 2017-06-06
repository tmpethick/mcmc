// @flow
import seedrandom from 'seedrandom';
import { identity } from 'fantasy-combinators';
import { Map } from 'immutable';

import Do from '../src/Do';
import MarkovChain, { markovChainMetropolisHastings } from '../src/MarkovChain';
import Average from '../src/monoid/average';
import { normal, observe } from '../src/dst/dst';

describe('MarkovChain', () => {
  test('run simple chain', () => {
    const mc = new MarkovChain(identity, x => x + 1, identity, 1);
    expect(mc.take(4).toArray()).toEqual([1, 2, 3, 4]);
  });

  test('run with average transformer', () => {
    const outputTransformer = x => new Map({ x });
    const mc = new MarkovChain(identity, x => x + 1, outputTransformer, 1);
    expect(mc.take(4).mean().toJS()).toEqual({ x: 2.5 });
  });

  test('run metropolisHasting 1-dim', () => {
    // TODO: it's random and might give false positive.
    // For now specify the seed for which we know it works.
    seedrandom(1, { global: true });
    const model = normal('a', 10, 1);
    expect(
      markovChainMetropolisHastings(model)
        .burn(100)
        .take(10000)
        .mean()
        .get('a'),
    ).toBeCloseTo(10, 1);
  });

  test('run metropolisHasting 2-dim', () => {
    // TODO: it's random and might give false positive.
    const model = normal('a', 10, 1).chain(a => normal('b', a + 2, 0.1));
    const chain = markovChainMetropolisHastings(model)
      .burn(100)
      .take(1000)
      .mean();
    expect(chain.get('a')).toBeCloseTo(10, 1);
    expect(chain.get('b')).toBeCloseTo(12, 1);
  });

  test('observation', () => {
    seedrandom(1, { global: true });
    const chain = markovChainMetropolisHastings(
      Do(function* () {
        const mu = yield normal('mu', 100, 10);
        return observe(normal('o', mu, 5), 150);
      }),
    )
      .burn(300)
      .take(3000);
    expect(chain.mean().get('mu')).toBeCloseTo(140, 0);
  });
});
