// src/services/Analytics.ts
import { Effect, Context, Duration, Layer, Console, Random } from "effect";

class Analytics extends Context.Tag("Analytics")<Analytics, AnalyticsImpl>() {}

export interface AnalyticsImpl {
  readonly logEvent: (
    eventName: string,
    params: Record<string, string | number>
  ) => Effect.Effect<void, never>;
}

export const withDurationAnalytics =
  (eventName: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) => {
    return Effect.timed(self).pipe(
      Effect.tap(([duration, _result]) =>
        Analytics.pipe(
          Effect.flatMap((analytics) =>
            analytics.logEvent(eventName, {
              duration_ms: Duration.toMillis(duration),
            })
          )
        )
      ),
      Effect.map(([_duration, result]) => result)
    );
  };

const AnalyticsToLog = Layer.succeed(
  Analytics,
  Analytics.of({
    logEvent: (eventName, params) =>
      Console.log(`Event logged: ${eventName}`, params),
  })
);

const loadAssets = (name: string) =>
  Random.nextIntBetween(50, 300).pipe(
    Effect.andThen((delay) => Effect.sleep(Duration.millis(delay))),
    withDurationAnalytics(`load_asset_${name}`)
  );

const main = Effect.forEach(
  ["asset1", "asset2", "asset3"],
  (name) => loadAssets(name),
  {
    concurrency: "unbounded",
  }
);

Effect.runPromise(Effect.provide(main, AnalyticsToLog)).then(() => {
  console.log("All assets loaded and events logged.");
});
