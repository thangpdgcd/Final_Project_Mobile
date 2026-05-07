let hasHandled = false;

export async function handleUnauthorizedOnce() {
  if (hasHandled) return;
  hasHandled = true;

  try {
    const [{ store }, { forceLogout }] = await Promise.all([
      import('@/redux/store'),
      import('@/redux/slices/authSlice'),
    ]);
    store.dispatch(forceLogout());
  } catch {
    // best-effort; app will still fail requests until re-login
  } finally {
    // allow future 401s after a short window (prevents spamming dispatch)
    setTimeout(() => {
      hasHandled = false;
    }, 1500);
  }
}
