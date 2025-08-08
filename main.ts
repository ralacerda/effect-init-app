import { Effect, Schedule } from "effect";
import { AppContext } from "./providers.ts";
import { NodeRuntime } from "@effect/platform-node";

const logRetryError = (operation: string) => (error: unknown) =>
  Effect.logError(
    `Retrying ${operation} due to error: ${JSON.stringify(error)}`
  );

const main = Effect.gen(function* () {
  // Get the context
  const ctx = yield* AppContext;

  // Start firebase with logging, span, and retry logic
  yield* Effect.log("Starting firebase");
  const firebase = yield* Effect.withLogSpan("firebase")(
    Effect.retry(
      Effect.tapError(ctx.startFirebase, logRetryError("firebase")),
      Schedule.recurs(30)
    )
  );
  yield* Effect.log(`Finished firebase: ${JSON.stringify(firebase)}`);

  // Start all operations in parallel with retry logic
  yield* Effect.log(
    "Starting parallel operations: assets, quota, and purchase"
  );

  const result = yield* Effect.all(
    {
      assets: Effect.gen(function* () {
        yield* Effect.log("Starting assets");
        return yield* Effect.withLogSpan("assets")(
          Effect.retry(
            Effect.tapError(ctx.loadAssets, logRetryError("assets")),
            Schedule.recurs(30)
          )
        );
      }),

      quota: Effect.gen(function* () {
        yield* Effect.log("Starting quota");
        return yield* Effect.withLogSpan("quota")(
          Effect.retry(
            Effect.tapError(ctx.getUserQuota(firebase), logRetryError("quota")),
            Schedule.recurs(30)
          )
        );
      }),

      purchase: Effect.gen(function* () {
        yield* Effect.log("Starting purchase");
        return yield* Effect.withLogSpan("purchase")(
          Effect.retry(
            Effect.tapError(
              ctx.startPurchase(firebase),
              logRetryError("purchase")
            ),
            Schedule.recurs(30)
          )
        );
      }),
    },
    {
      concurrency: "unbounded",
    }
  );

  return `Success with result: ${JSON.stringify(result)}`;
});

const program = Effect.gen(function* () {
  try {
    const result = yield* main;
    yield* Effect.log(result);
    return result;
  } catch (error) {
    const errorMessage = `Failed with error: ${error}`;
    yield* Effect.log(errorMessage);
    return errorMessage;
  }
});

// Run the program
program.pipe(Effect.provide(AppContext.Default), NodeRuntime.runMain);
