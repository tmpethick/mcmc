// @flow
import R from 'ramda';
import seedrandom from 'seedrandom';

import Do from '../src/Do';
import { markovChainMetropolisHastings } from '../src/MarkovChain';
import { observe, normal, exponential, Return } from '../src/dst/dst';
import data from './testdata/linearPoints';
import { writeList } from './utils/file';

const toFile = writeList(
  `${__dirname}/output/linearRegression.csv`,
  'intercept, slope, sigma',
);

describe('examples', () => {
  test('linearRegression', () => {
    seedrandom(1, { global: true });
    const chain = markovChainMetropolisHastings(
      Do(function* () {
        const sigma = yield exponential('sigma', 0.5);
        const intercept = yield normal('intercept', 0, 10);
        const slope = yield normal('slope', 0, 10);
        for (const [x, y] of data) {
          yield observe(normal('o', intercept + slope * x, sigma), y);
        }
        return Return(null);
      }),
    )
      .take(10000)
      .toArray();
    const toList = R.map(v => [
      v.get('intercept'),
      v.get('slope'),
      v.get('sigma'),
    ]);
    R.compose(toFile, toList)(chain);
  });
});
