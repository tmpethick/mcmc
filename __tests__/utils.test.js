// @flow
import { Map } from 'immutable';
import { plotDataFrom, bundle } from '../src/utils/plot';

describe('Utils', () => {
  test('plotDataFrom', () => {
    expect(plotDataFrom(Map({ a: 1 }))).toEqual([
      {
        y: [1],
        mode: 'lines',
        name: 'a',
      },
    ]);
  });

  test('bundle', () => {
    expect(bundle([Map({ a: 1, b: 10 }), Map({ a: 2, b: 11 })])).toEqual([
      [1, 2],
      [10, 11],
    ]);
  });
});
