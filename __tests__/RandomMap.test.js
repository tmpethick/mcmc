// @flow
import RandomMap from '../src/RandomMap';

describe('RandomMap', () => {
  test('get', () => {
    const rm = new RandomMap().set('a', 2);
    expect(rm.get('a')).toEqual(2);
  });
});
