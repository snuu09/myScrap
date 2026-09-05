/** Spinner-only wait while Auth session restores (no copy). */
export function AuthWaiting() {
  return (
    <div className="auth-waiting" role="status" aria-live="polite" aria-busy="true">
      <div className="auth-waiting-panel auth-waiting-panel--minimal">
        <div className="auth-waiting-spinner" aria-hidden />
      </div>
    </div>
  );
}
