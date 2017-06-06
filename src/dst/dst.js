// @flow
import daggy from 'daggy';
import { Free } from 'fantasy-frees';
import { chain } from 'fantasy-land';
import { identity, compose } from 'fantasy-combinators';

// Elementary random primitives
/* eslint-disable flowtype/type-id-match */
export type ERPNameType = string;
export type ModelFType = any;
export type ObsModelFType = any;
/* eslint-disable flowtype/type-id-match */

// A very simple substitute for the lack of type support from free. In Haskell
// type ModelType r = Free ObsModelF ModelF r
export type ModelType = {
  resume: () => any
};

// Dangerously make it `fantasy-land` compatible by extending prototype.
Free.prototype[chain] = Free.prototype.chain;

const ModelF = daggy.taggedSum('ModelF', {
  BernoulliF: ['n', 'p', 'f'],
  BetaF: ['n', 'a', 'b', 'f'],
  NormalF: ['n', 'mu', 'sigma', 'f'],
  UniformF: ['n', 'a', 'b', 'f'],
  DiscreteUniformF: ['n', 'a', 'b', 'f'],
  PoissonF: ['n', 'lambda', 'f'],
  ExponentialF: ['n', 'rate', 'f'],
});

export const BernoulliF = ModelF.BernoulliF;
export const BetaF = ModelF.BetaF;
export const NormalF = ModelF.NormalF;
export const UniformF = ModelF.UniformF;
export const DiscreteUniformF = ModelF.DiscreteUniformF;
export const PoissonF = ModelF.PoissonF;
export const ExponentialF = ModelF.ExponentialF;

ModelF.prototype.map = function (f) {
  return this.cata({
    BernoulliF: (n, p, next) => BernoulliF(n, p, compose(f)(next)),
    BetaF: (n, a, b, next) => BetaF(n, a, b, compose(f)(next)),
    NormalF: (n, mu, sigma, next) => NormalF(n, mu, sigma, compose(f)(next)),
    UniformF: (n, a, b, next) => UniformF(n, a, b, compose(f)(next)),
    DiscreteUniformF: (n, a, b, next) =>
      DiscreteUniformF(n, a, b, compose(f)(next)),
    PoissonF: (n, lambda, next) => PoissonF(n, lambda, compose(f)(next)),
    ExponentialF: (n, rate, next) => ExponentialF(n, rate, compose(f)(next)),
  });
};

const ObsModelF = daggy.taggedSum('ModelF', {
  PureF: ['dist'],
  ObsF: ['dist', 'obs'],
});

ObsModelF.prototype.map = function (f) {
  return this.cata({
    PureF: dist => ObsModelF.PureF(dist.map(f)),
    ObsF: (dist, obs) => ObsModelF.ObsF(dist.map(f), obs),
  });
};
export const PureF = ObsModelF.PureF;
export const ObsF = ObsModelF.ObsF;

export const observe = (free, obs) =>
  Free.liftF(
    free.cata({
      Suspend: obsModel =>
        obsModel.cata({
          PureF: dist => ObsF(dist, obs),
          ObsF: (dist, _) => ObsF(dist, obs),
        }),
    }),
  );

export const bern = (n: string, p: number) =>
  Free.liftF(PureF(BernoulliF(n, p, identity)));
export const beta = (n: string, a: number, b: number) =>
  Free.liftF(PureF(BetaF(n, a, b, identity)));
export const normal = (n: string, mu: number, sigma: number) =>
  Free.liftF(PureF(NormalF(n, mu, sigma, identity)));
export const uniform = (n: string, a: number, b: number) =>
  Free.liftF(PureF(UniformF(n, a, b, identity)));
export const discreteUniform = (n: string, a: number, b: number) =>
  Free.liftF(PureF(DiscreteUniformF(n, a, b, identity)));
export const poisson = (n: string, p: number) =>
  Free.liftF(PureF(PoissonF(n, p, identity)));
export const exponential = (n: string, p: number) =>
  Free.liftF(PureF(ExponentialF(n, p, identity)));
export const Return = Free.of;
