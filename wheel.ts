type Effect<A> = () => A;

const randomNumber: Effect<number> = () => Math.random();

function run<A>(effect: Effect<A>): A {
  return effect();
}

function map<A, B>(f: (a: A) => B): (effect: Effect<A>) => Effect<B> {
  return (effect) => () => f(effect());
}

function tap<A>(f: (a: A) => void): (effect: Effect<A>) => Effect<A> {
  return (effect) =>
    map<A, A>((a) => {
      f(a);
      return a;
    })(effect);
}

function log<A>(effect: Effect<A>): Effect<A> {
  return tap<A>((v) => console.log(v))(effect);
}

function repeat(times: number): (effect: Effect<void>) => Effect<void> {
  return (effect) => () => {
    for (let i = 0; i < times; i++) {
      effect();
    }
  };
}
function pipe<A>(
  ...fns: Array<(effect: Effect<any>) => Effect<any>>
): (effect: Effect<A>) => Effect<any> {
  return (effect: Effect<A>) => fns.reduce((acc, fn) => fn(acc), effect);
}

const main = pipe(
  () => randomNumber,
  map((n) => n * 100),
  tap((n) => console.log(`Random number: ${n}`)),
  repeat(3),
  log
);

run(main);
