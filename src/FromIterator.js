// @flow
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class FromIterator {
  _stopped: boolean = false;
  iterator: Iterator<any>;

  constructor(iterator) {
    this.iterator = iterator;
  }

  async start(out) {
    // console.log("start");
    this._stopped = false;
    while (!this._stopped) {
      // TODO: necessary hack to not block UI. Move to web workers instead.
      await sleep(0);
      // console.log("sampling", this._stopped);
      out.next(this.iterator.next().value);
    }
    // console.log(this._stopped);
  }

  stop() {
    // console.log("stop");
    this._stopped = true;
  }
}

export const producerFromIterator = iterator => new FromIterator(iterator);
