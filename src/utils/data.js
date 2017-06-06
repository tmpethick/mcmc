// @flow
import R from 'ramda';

export const mapIndexed = R.addIndex(R.map);
export const addIndex = mapIndexed((val: number, idx: number) => [idx, val]);
