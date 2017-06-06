// @flow
import { concat } from 'fantasy-land';
import { Map } from 'immutable';
import R from 'ramda';

import Average from './monoid/average';

const concatMaps = (map1, map2) =>
  map1.mergeWith(
    (prev, next) => prev[concat](next),
    map2.map(v => new Average(v)),
  );
const runAverageMap = map1 => map1.map(v => v.value());

function* take<T>(n: number, iterator: Iterator<T>): Iterator<T> {
  // eslint-disable-next-line no-param-reassign, no-plusplus
  for (; n > 0; n--) {
    const r = iterator.next();
    if (r.done) return r.value;
    yield r.value;
  }
}

function* burn<T>(n: number, iterator: Iterator<T>): Iterator<T> {
  // eslint-disable-next-line no-param-reassign, no-plusplus
  for (; n > 0; n--) {
    iterator.next();
  }
  yield* iterator;
}

export default class Sampler<T> {
  iterator: Iterator<T>;

  constructor(iterator: Iterator<T>) {
    this.iterator = iterator;
  }

  next(): any {
    return this.iterator.next();
  }

  burn(n: number): Sampler<T> {
    return new Sampler(burn(n, this.iterator));
  }

  take(n: number): Sampler<T> {
    return new Sampler(take(n, this.iterator));
  }

  /**
   * Expect iterator output to be a Map.
   */
  mean() {
    const arr = Array.from(this.iterator);
    return arr.length > 0
      ? runAverageMap(arr.reduce(concatMaps, new Map()))
      : null;
  }

  toArray() {
    return Array.from(this.iterator);
  }
}
