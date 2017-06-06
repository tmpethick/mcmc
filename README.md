# mcmc

This is a proof of concept using ES6 Generators to implement a probabilistic programming language with a Free Monad.
It is currently highly inefficient but is usable for smaller problems.

## Usage

An example program models the changepoint for number of British coal-mining disasters pulled from [Hierarchical Bayesian Analysis of Changepoint Problems](http://www.jstor.org/stable/2347570).

```js
// Note that currently it is not on npm so importing as 'mcmc' is not possible.
import { Do, observe, exponential, discreteUniform, poisson, addIndex } from 'mcmc';
import data from '../data';
const startYear = 1851;
const indexedData = addIndex(data).map(([i, v]) => [i + startYear, v]);
const model = Do(function* () {
  const λ1 = yield exponential('lambda1', 1);
  const λ2 = yield exponential('lambda2', 1);
  const tau = yield discreteUniform(
    'tau',
    startYear,
    startYear + data.length,
  );
  for (const [idx, o] of indexedData) {
    if (idx < tau) {
      yield observe(poisson('o', λ1), o);
    } else {
      yield observe(poisson('o', λ2), o);
    }
  }
  return Return(null);
});
const markovChain = markovChainMetropolisHastings(model);
const trace = markovChain
  .burn(100)
  .take(1000)
  .toArray();
```

See the example section for how to run this example.

## Development

This requires yarn (see [the yarn installation instruction](https://yarnpkg.com/en/docs/install) which will install all dependencies including node).

```
yarn
yarn test:watch
```

These two commands 1) install dependencies 2) runs tests and watches files for changes. 

## Examples

The examples can be run with:

```
yarn examples:coal
yarn examples:linear
yarn examples:height
```

(Currently this uses `jest` under the hood which ideally should be changed for a more optimized compilation).

To run them all use `yarn examples`. 
The result will be outputted in `examples/output`.
Afterwards plots can be produced by running `examples/examples-plotter.R`. 

## Structure

Here the most interesting part of the program is listed:

```
src/dst/dst.js            The Domain Specific Language (DST) implemented as a Free Monad.
src/dst/interpreter.js    Interprets the DST to a function updating an immutable database.
src/MarkovChain.js        Includes the Metropolis-Hastings algorithm using the interpreter.
src/distributions         All the Elementary Random Primitive (ERPs).
```

## Tools 

* Prettier and eslint for automatic formatting.
* Babel to allow for modern JS syntax like generators.
* Flow is used for static type analysis.
* Jest is used for testing.
* Webpack is used for web based plotting examples. It automates running babel on every file change and updating the browser (using [this excellent guide](https://www.sitepoint.com/beginners-guide-to-webpack-2-and-module-bundling/)).

## Experiment

The Markov Chain was implemented as a iterator which made it easy to convert it to a stream and then stream it to an output while it samples.
We have experimented with this approach in `src/experiments/liveplot.js` using `xstream` and `cyclejs`.
A local webserver can be hosted on `http://localhost:8080` by running:

```
yarn start
```
