import { Effect, Fiber } from "effect";

const program = Effect.gen(function* () {
  // Fork a fiber that runs indefinitely, printing "Hi!"
  const fiber = yield* Effect.fork(
    Effect.forever(Effect.log("Hi!").pipe(Effect.delay("10 millis")))
  );
  // yield* Effect.sleep("30 millis");
  // // Interrupt the fiber and get an Exit value detailing how it finished
  // const exit = yield* Fiber.interrupt(fiber);
  // console.log(exit);
});

Effect.runFork(program);
