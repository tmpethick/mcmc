// @flow
import immutagen from 'immutagen';

/**
 * Compose mimicks the behaviour of Haskells do-notation.
 *
 * Using `immutagen` allows the generator to run multiple times.
 * @param {GeneratorFunctionConstructor} Generator
 */
const Do = (Generator) => {
  const gen = immutagen(Generator);
  const step = next =>
    (value) => {
      const result = next(value);
      // prettier-ignore
      return result.next
        ? result.value.chain(step(result.next))
        : result.value;
    };
  return step(gen)();
};

export default Do;
