// @flow
import R from 'ramda';
import fs from 'fs';

// eslint-disable-next-line import/prefer-default-export
export const writeList = R.curry(
  (filename: string, header: string, arr: [[number]]) => {
    const file = fs.createWriteStream(filename);
    file.on('error', (err: Error) => {
      throw err;
    });
    file.write(`${header}\n`);
    arr.forEach((v: [number]) => {
      file.write(`${v.join(', ')}\n`);
    });
    file.end();
  },
);
