// @flow
import 'babel-polyfill';
import xs from 'xstream';
import { run } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { makeDOMDriver } from '@cycle/dom';
import { html } from 'snabbdom-jsx';

import buffer from '../stream/buffer';
import { producerFromIterator } from '../FromIterator';
import { plotDataFrom, bundle } from '../utils/plot';

import Do from '../Do';
import { markovChainMetropolisHastings } from '../MarkovChain';
import { observe, normal, exponential, Return } from '../dst/dst';

const linearObs = [[1, 5], [4, 14], [5, 17]];

const runMarkovChain = () =>
  markovChainMetropolisHastings(
    Do(function* () {
      const sigma = yield exponential('sigma', 0.5);
      const intercept = yield normal('intercept', 0, 5);
      const slope = yield normal('slope', 0, 5);
      for (const [x, y] of linearObs) {
        yield observe(normal('o', intercept + slope * x, sigma), y);
      }
      return Return(null);
    }),
  );

const intent = domSource => ({
  toggle$: domSource
    .select('.start')
    .events('click')
    .fold((toggled, e) => !toggled, false),
});

const model = (actions) => {
  const samples$$ = actions.toggle$.map(
    on =>
      on
        ? xs.create(producerFromIterator(runMarkovChain().iterator))
        : xs.empty(),
  );
  return {
    ...actions,
    samples$$,
  };
};

const view = state$ =>
  state$.map(toggle => (
    <div>
      <button className="start">{toggle ? 'Stop' : 'Start'}</button>
      <div id="trace" />
    </div>
  ));

function getDOMElement$(domSource, selector) {
  return domSource
    .select(selector)
    .elements()
    .filter(el => el.length)
    .map(el => el[0])
    .take(1);
}

function main(sources) {
  const modelMap = model(intent(sources.DOM));
  return {
    DOM: view(modelMap.toggle$),
    plotly: xs
      .combine(modelMap.samples$$, getDOMElement$(sources.DOM, '#trace'))
      .map(([samples$, element]) => ({
        element,
        samples$,
      })),
  };
}

function makePlotlyDriver() {
  return function plotlyDriver(stream$) {
    let sampleSubscription;
    stream$.addListener({
      next: ({ element, samples$ }) => {
        samples$.take(1).subscribe({
          next: (sample) => {
            console.log(Array.from(plotDataFrom(sample)));
            Plotly.newPlot(element, plotDataFrom(sample));
          },
        });
        sampleSubscription && sampleSubscription.unsubscribe();
        sampleSubscription = samples$
          .compose(buffer(xs.periodic(100)))
          .subscribe({
            next: (samples) => {
              const data = bundle(samples);
              Plotly.extendTraces(
                element,
                {
                  y: data,
                },
                data.map((v, i) => i),
              );
            },
            complete: () => {
              // TODO: hack
              try {
                Plotly.restyle(element, {
                  type: 'histogram',
                  opacity: 0.5,
                });
              } catch (e) {}
            },
          });
      },
    });
  };
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  plotly: makePlotlyDriver(),
};

run(main, drivers);
