const firebase = "Firebase";
export type Firebase = typeof firebase;

// Helper to randomly fail based on a percentage (0-100)
function shouldFail(percentage: number): boolean {
  return Math.random() * 100 < percentage;
}
function randomNormalDelay(mean: number, stdDev: number): number {
  // Box-Muller transform
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // avoid 0
  while (v === 0) v = Math.random();
  const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const delay = Math.round(mean + stdDev * standardNormal);
  return Math.max(0, delay); // no negative delays
}

export function loadAssets(): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(75)) { // 30% chance to fail
        reject(new Error("Assets loading failed"));
      } else {
        resolve();
      }
    }, randomNormalDelay(300, 50));
  });
}

export function startFirebase(): Promise<Firebase> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(75)) { // 75% chance to fail
        reject(new Error("Firebase initialization failed"));
      } else {
        resolve(firebase);
      }
    }, randomNormalDelay(1000, 200));
  });
}

export function getUserQuota(firebase: Firebase): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(75)) { // 75% chance to fail
        reject(new Error("User quota retrieval failed"));
      } else {
        resolve(100);
      }
    }, randomNormalDelay(200, 40));
  });
}

export function startPurchase(firebase: Firebase): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(75)) { // 75% chance to fail
        reject(new Error("Purchase initialization failed"));
      } else {
        resolve();
      }
    }, randomNormalDelay(500, 100));
  });
}
