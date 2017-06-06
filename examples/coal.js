// @flow
import R from 'ramda';
import seedrandom from 'seedrandom';

import Do from '../src/Do';
import { markovChainMetropolisHastings } from '../src/MarkovChain';
import {
  exponential,
  poisson,
  discreteUniform,
  observe,
  Return,
} from '../src/dst/dst';
import data from './testdata/coal';
import { addIndex } from '../src/utils/data';
import { writeList } from './utils/file';

const startYear = 1851;
const indexedData = addIndex(data).map(([i, v]) => [i + startYear, v]);
const toFile = writeList(
  `${__dirname}/output/coal.csv`,
  'tau, lambda1, lambda2',
);

describe('examples', () => {
  test('coal', () => {
    seedrandom(1, { global: true });
    const chain = markovChainMetropolisHastings(
      Do(function* () {
        const λ1 = yield exponential('lambda1', 1);
        const λ2 = yield exponential('lambda2', 1);
        const tau = yield discreteUniform(
          'tau',
          startYear,
          startYear + data.length,
        );
        for (const [idx, o] of indexedData) {
          if (idx < tau) {
            yield observe(poisson('o', λ1), o);
          } else {
            yield observe(poisson('o', λ2), o);
          }
        }
        return Return(null);
      }),
    )
      .take(10000)
      .toArray();
    const toList = R.map(v => [
      v.get('tau'),
      v.get('lambda1'),
      v.get('lambda2'),
    ]);
    R.compose(toFile, toList)(chain);
  });
});
