import Sampler from '../src/Sampler';

test('test Sampler', () => {
  const sampler = new Sampler(
    (function* () {
      yield* [1, 2, 3, 4, 5];
    }()),
  );
  expect(sampler.burn(2).take(20).toArray()).toEqual([3, 4, 5]);
});
