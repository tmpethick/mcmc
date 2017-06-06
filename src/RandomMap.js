// @flow
import { Map, List } from 'immutable';
import { concat } from 'fantasy-land';
import R from 'ramda';

const randomR = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min)) + min;

export default class RandomMap<T, S> {
  _map: Map<T, S>;
  _keyList: List<T>;

  constructor(map: Map<T, S> = Map(), keys: List<T> = List()) {
    this._map = map;
    this._keyList = keys;
  }

  set(key: T, value: S): RandomMap<T, S> {
    return new RandomMap(
      this._map.set(key, value),
      this._map.has(key) ? this._keyList : this._keyList.push(key),
    );
  }

  get(key: T, notSetValue?: S): S {
    return this._map.get(key, notSetValue);
  }

  getRandomName(notSetValue?: T): ?T {
    if (!this._keyList.size) return notSetValue;
    const index = randomR(0, this._keyList.size);
    return this._keyList.get(index);
  }

  map<P>(mapper: (value: S, key: T, iter: this) => P): RandomMap<T, P> {
    return new RandomMap(this._map.map(mapper), this._keyList);
  }

  getMap() {
    return this._map;
  }
}
