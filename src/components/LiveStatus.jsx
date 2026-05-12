/**
 * LiveStatus
 *
 * Displays whether the dashboard is currently refreshing live data,
 * when the last successful update happened, and how many refreshes
 * have completed during the session.
 */

export default function LiveStatus({ refreshing, lastUpdated, refreshCount }) {
  return (
    <div className="live-status-card">
      <div className={refreshing ? "live-status updating" : "live-status"}>
        <span className="live-dot" />
        {refreshing ? "Updating..." : "Live"}
      </div>

      <div className="last-updated">
        {lastUpdated
          ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
          : "Waiting for first update"}
      </div>

      <div className="last-updated">Refresh count: {refreshCount}</div>
    </div>
  );
}