interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

let sentinel: WakeLockSentinelLike | null = null;

export async function requestWakeLock(): Promise<void> {
  try {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinelLike> };
    };
    if (!nav.wakeLock?.request) return;
    if (sentinel && !sentinel.released) return;
    sentinel = await nav.wakeLock.request('screen');
  } catch {
    // gracefully ignore — screen will dim as usual
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    if (sentinel && !sentinel.released) await sentinel.release();
  } catch {
    // ignore
  }
  sentinel = null;
}

/** Re-acquire the lock when the tab becomes visible again. */
export function attachWakeLockVisibilityHandler(): () => void {
  const handler = () => {
    if (document.visibilityState === 'visible') void requestWakeLock();
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
