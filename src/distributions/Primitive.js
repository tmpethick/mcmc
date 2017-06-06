// @flow
import { chain } from 'fantasy-land';
import NotImplementedError from '../exception/NotImplementedError';
import type { Prob } from '../types';

/**
 * Inspired by Scala Breeze implementation.
 * @param {*} rand
 * @param {*} func
 */
function createFlatMappedRand<T, S>(
  rand: Primitive<T>,
  func: (t: T) => Primitive<S>,
): Primitive<S> {
  return new class FlatMappedRand extends Primitive<S> {
    // TODO: Output array for each random variable.
    sample(): S {
      return func(rand.sample()).sample();
    }

    // TODO: make x immutable
    logPdf(x: S): Prob {
      throw new NotImplementedError(
        '`logPdf` is not supported for flatmapped structure',
      );
    }
  }();
}

export default class Primitive<T> {
  static sameType(p1: Primitive<*>, p2: Primitive<*>): boolean {
    return p1.constructor === p2.constructor;
  }

  equals(p1: Primitive<*>): boolean {
    throw new NotImplementedError('`equals` is not implemented');
  }

  sample(): T {
    throw new NotImplementedError('`sample` is not implemented');
  }

  logPdf(x: T): Prob {
    throw new NotImplementedError('`logPdf` is not implemented');
  }

  sd(): number {
    throw new NotImplementedError('`sd` is not implemented');
  }

  driftKernel(x: T): Primitive<T> {
    throw new NotImplementedError('`driftKernel` is not implemented');
  }

  /**
   * Converts random sampler of one type to random sampler of another.
   */
  flatMap<S>(f: (t: T) => Primitive<S>): Primitive<S> {
    return createFlatMappedRand(this, f);
  }

  chain<S>(f: (t: T) => Primitive<S>): Primitive<S> {
    return this.flatMap(f);
  }

  [chain]<S>(f: (t: T) => Primitive<S>): Primitive<S> {
    return this.flatMap(f);
  }
}

export class Pure<T> extends Primitive<T> {
  x: T;

  constructor(x: T) {
    super();
    this.x = x;
  }

  sample(): T {
    return this.x;
  }
}
