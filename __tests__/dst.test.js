// @flow
import { List } from 'immutable';
import { constant } from 'fantasy-combinators';

import { bern, beta, observe, Return } from '../src/dst/dst';
import Do from '../src/Do';

const interpret = (model) => {
  function loop(model, log) {
    return model.resume().fold(
      (x) => {
        const [dist, obs] = x.cata({
          PureF: dist => [dist],
          ObsF: (dist, obs) => [dist, obs],
        });
        return dist.cata({
          BernoulliF: (n, a, next) =>
            loop(next(5), log.push(`Bern ${a} ${obs}`)),
          BetaF: (n, a, b, next) =>
            loop(next(10), log.push(`Beta ${a} ${b} ${obs}`)),
        });
      },
      constant(log),
    );
  }
  return loop(model, List());
};

describe('dst', () => {
  test('constructor', () => {
    const model = bern('a', 1).chain(a => beta('b', a, a + 10));
    const output = interpret(model);
    expect(output.toJS()).toEqual(['Bern 1 undefined', 'Beta 5 15 undefined']);
  });

  test('with observe', () => {
    const model = bern('a', 1).chain(a => observe(beta('b', a, a + 10), 2));
    const output = interpret(model);
    expect(output.toJS()).toEqual(['Bern 1 undefined', 'Beta 5 15 2']);
  });

  test('with Do and observe', () => {
    const model = Do(function* () {
      const a = yield bern('a', 1);
      const b = yield observe(beta('b', a, a + 10), 2);
      return Return(a);
    });
    const output = interpret(model);
    expect(output.toJS()).toEqual(['Bern 1 undefined', 'Beta 5 15 2']);
  });

  // test("should fail on non primitive", () => {
  //   const model = bern("a", 1).chain(a => observe(beta("b", a, a + 10)));
  //   const output = interpret(model);
  //   expect(output.toJS()).toEqual(["Bern 1", "Beta 5 15"]);
  // });
});
