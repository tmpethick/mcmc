// @flow
import R from 'ramda';
import { Map } from 'immutable';

export const plotDataFrom = data =>
  data
    .map((val, key) => ({
      y: [val],
      mode: 'lines',
      name: key,
    }))
    .toArray();

// [{a: 1, b: 10}, {a: 2, b: 11}] => [[1, 2], [10, 11]]
export const bundle = (samples: Array<Map<string, number>>) => {
  if (samples.length === 0) return [];
  const first = samples.shift();
  const a = first.map(val => [val]).toJS();
  R.forEach(d => d.map((v, k) => a[k].push(v)))(samples);
  return R.values(a);
};
