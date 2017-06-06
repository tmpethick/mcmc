// @flow

export const value = "monoid/value";

export interface Monoid<V> {
  empty(): Monoid<V>,
  concat(m: Monoid<V>): Monoid<V>,
  value(): V
}
