/**
 * TradingPanel
 *
 * Displays the selected sensor's latest value, strategy signals,
 * suggested action, current simulated position, trade buttons,
 * and simple evaluation metrics.
 */

import { getSignalColor } from "../utils/signalStyles";

export default function TradingPanel({
  latest,
  signals,
  suggested,
  selectedSensor,
  position,
  onTrade,
  accuracy,
  strength,
}) {
  return (
    <aside className="right-panel">
      <h4 className="panel-heading">TRADING PANEL</h4>

      <div className="metric-card">
        <div className="metric-row">
          <span>Price</span>
          <strong>{latest?.value ?? "-"}</strong>
        </div>

        <div className="metric-row">
          <span>Return</span>
          <strong>{latest?.return?.toFixed(2) ?? "-"}</strong>
        </div>
      </div>

      <div className="signal-list">
        {signals.map(({ name, signal }) => (
          <div key={name} className="signal-row">
            <span>{name}</span>
            <strong style={{ color: getSignalColor(signal) }}>{signal}</strong>
          </div>
        ))}
      </div>

      <div className="suggested-card">
        <span>Suggested action</span>
        <strong style={{ color: getSignalColor(suggested) }}>
          {suggested}
        </strong>
      </div>

      <div className="position-row">
        <span>Current position</span>
        <strong>{position || "NONE"}</strong>
      </div>

      <div className="trade-buttons">
        <button
          type="button"
          onClick={() => onTrade(selectedSensor, "BUY")}
          className={`trade-button buy ${
            suggested === "BUY" ? "recommended" : ""
          }`}
        >
          BUY
        </button>

        <button
          type="button"
          onClick={() => onTrade(selectedSensor, "SELL")}
          className={`trade-button sell ${
            suggested === "SELL" ? "recommended" : ""
          }`}
        >
          SELL
        </button>
      </div>

      <div className="evaluation-section">
        <h4 className="panel-heading">EVALUATION</h4>

        <div className="metric-row">
          <span>Accuracy</span>
          <strong
            className={Number(accuracy) > 60 ? "positive-text" : "negative-text"}
          >
            {accuracy}%
          </strong>
        </div>

        <div className="metric-row">
          <span>Signal Strength</span>
          <strong>{strength}</strong>
        </div>
      </div>
    </aside>
  );
}