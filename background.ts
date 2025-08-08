import { Effect, Console, Schedule, Fiber, Runtime } from "effect";

// Daemon fiber that logs a message repeatedly every second
const daemon = Effect.repeat(
  Effect.sync(() => console.log("SIDE EFFECT: Daemon fiber running...")),
  Schedule.fixed("1 second")
);

// Better approach: Return the fiber handle instead of an Exit
const startDaemon = Effect.gen(function* () {
  const fiber = yield* Effect.forkDaemon(daemon);
  return fiber;
});

// Run the Effect and get the fiber handle
const fiber = await Effect.runPromise(startDaemon);

console.log("Daemon fiber has been started.");
console.log("Now in non-Effect land...");

// Simulate some non-Effect work
await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds to see daemon output

console.log("Interrupting daemon fiber...");

// Interrupt the fiber from non-Effect code
const exitResult = await Effect.runPromise(Fiber.interrupt(fiber));
console.log("Daemon fiber interrupted:", exitResult);

console.log("Main program finished.");
