// @flow
// Pulled from the `monoid-average` npm module
import { concat, empty } from 'fantasy-land';

function MonoidAverage(value, count) {
  this._value = value;
  this._count = typeof count === 'undefined' ? 1 : count;
}

MonoidAverage.prototype._value = undefined;
MonoidAverage.prototype._count = undefined;

MonoidAverage[empty] = function () {
  return new MonoidAverage(0, 0);
};

MonoidAverage.prototype[concat] = function (other) {
  return new MonoidAverage(
    this._value + other._value,
    this._count + other._count,
  );
};

MonoidAverage.prototype.value = function () {
  if (this._count) {
    return this._value / this._count;
  }
  return 0;
};

MonoidAverage.prototype.toNative = function () {
  return this.value();
};

export default MonoidAverage;
