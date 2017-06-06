// @flow
import split from 'xstream/extra/split';

const toArray = stream =>
  stream
    .fold(
      (arr, v) => {
        arr.push(v);
        return arr;
      },
      [],
    )
    .last();

// prettier-ignore
const buffer = split$ => stream$ => stream$
  .compose(split(split$))
  .map(toArray)
  .flatten();

export default buffer;
