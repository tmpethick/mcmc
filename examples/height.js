// @flow
import seedrandom from 'seedrandom';
import R from 'ramda';

import { markovChainMetropolisHastings } from '../src/MarkovChain';
import Do from '../src/Do';
import { normal, observe, Return } from '../src/dst/dst';
import { writeList } from './utils/file';

const toFile = writeList(`${__dirname}/output/height.csv`, 'mu');

/**
 * End to end tests.
 */
describe('examples', () => {
  test('height', () => {
    // Define student heights
    const obs = [
      200.5441,
      174.5726,
      194.1616,
      164.7823,
      196.3696,
      198.7111,
      191.0085,
      185.4956,
      184.1277,
      168.7725,
      173.9352,
      187.2442,
      171.7761,
      214.7169,
      174.5090,
      198.8049,
      181.9037,
      166.0401,
      196.6856,
      186.3147,
      173.8256,
      184.1791,
      190.8763,
      180.7360,
      197.7508,
      196.2175,
      172.0477,
      166.1818,
      183.6230,
      190.8607,
    ];
    seedrandom(1, { global: true });
    const chain = markovChainMetropolisHastings(
      Do(function* () {
        const mu = yield normal('mu', 170, 10);
        for (const o of obs) {
          yield observe(normal('o', mu, 12.4272), o);
        }
        return Return(null);
      }),
    ).take(10000);
    const toList = R.map(v => [v.get('mu')]);
    R.compose(toFile, toList)(chain.toArray());
  });
});
