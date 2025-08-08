import { Data } from "effect";
import { getUserQuota, loadAssets, startFirebase, startPurchase } from "./initializer.ts";
import { Effect, Context } from "effect";
import type { Firebase } from "./initializer.ts";

class FirebaseError extends Data.TaggedError("FirebaseError")<{
  cause: unknown;
}> {}

 class LoadingAssetsError extends Data.TaggedError("LoadingAssetsError")<{
  cause: unknown;
}> {}

class PurchaseError extends Data.TaggedError("PurchaseError")<{
  cause: unknown;
}> {}

class UserQuotaError extends Data.TaggedError("UserQuotaError")<{
  cause: unknown;
}> {}

export const startFirebaseEffect = Effect.tryPromise({
  try: () => startFirebase(),
  catch: (cause: unknown) => new FirebaseError({ cause })
});

export const loadAssetsEffect = Effect.tryPromise({
  try: () => loadAssets(),
  catch: (cause: unknown) => new LoadingAssetsError({ cause })
});

// You need to provide a Firebase instance to startPurchase and getUserQuota
export const startPurchaseEffect = (firebase: Firebase) => Effect.tryPromise({
  try: () => startPurchase(firebase),
  catch: (cause: unknown) => new PurchaseError({ cause })
});

export const getUserQuotaEffect = (firebase: Firebase) => Effect.tryPromise({
  try: () => getUserQuota(firebase),
  catch: (cause: unknown) => new UserQuotaError({ cause })
});

export class AppContext extends Effect.Service<AppContext>()("app/AppContext", {
  sync: () => ({
      startFirebase: startFirebaseEffect,
      loadAssets: loadAssetsEffect,
      startPurchase: startPurchaseEffect,
      getUserQuota: getUserQuotaEffect
    })
}) {}