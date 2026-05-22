/**
 * TradingPanel
 *
 * Displays:
 * - Current simulated market price
 * - Strategy signals
 * - Suggested trading action
 * - Portfolio balance
 * - Owned shares
 * - Current trading position
 * - BUY and SELL controls
 * - Evaluation metrics
 */

import React from "react";

import { getSignalColor } from "../utils/signalStyles";

export default function TradingPanel({
  latest,
  signals,
  suggested,
  selectedSensor,
  displayName,
  position,
  onTrade,
  accuracy,
  strength,
  balance,
  portfolio,
}) {
  return (
    <aside className="right-panel">
      <h4 className="panel-heading">TRADING PANEL</h4>

      {/* ASSET INFORMATION */}
      <div className="metric-card">
        <div className="metric-row">
          <span>Selected Asset</span>
          <strong>{displayName || "-"}</strong>
        </div>

        {selectedSensor && (
          <div className="selected-source">[{selectedSensor}]</div>
        )}

        <div className="metric-row">
          <span>Market Price</span>
          <strong>${latest?.value?.toFixed(2) ?? "-"}</strong>
        </div>

        <div className="metric-row">
          <span>Return</span>
          <strong>{latest?.return?.toFixed(2) ?? "-"}</strong>
        </div>
      </div>

      {/* PORTFOLIO INFORMATION */}
      <div className="metric-card">
        <div className="metric-row">
          <span>Portfolio Balance</span>
          <strong>${balance?.toFixed(2) ?? "0.00"}</strong>
        </div>

        <div className="metric-row">
          <span>Owned Shares</span>
          <strong>{portfolio?.[selectedSensor] || 0}</strong>
        </div>
      </div>

      {/* STRATEGY SIGNALS */}
      <div className="signal-list">
        {signals.map(({ name, signal }) => (
          <div key={name} className="signal-row">
            <span>{name}</span>

            <strong style={{ color: getSignalColor(signal) }}>
              {signal}
            </strong>
          </div>
        ))}
      </div>

      {/* PRIMARY RECOMMENDATION */}
      <div className="suggested-card">
        <span>Suggested Action</span>

        <strong style={{ color: getSignalColor(suggested) }}>
          {suggested}
        </strong>
      </div>

      {/* CURRENT POSITION */}
      <div className="position-row">
        <span>Current Position</span>

        <strong>{position || "NONE"}</strong>
      </div>

      {/* TRADING CONTROLS */}
      <div className="trade-buttons">
        <button
          type="button"
          onClick={() => onTrade("BUY")}
          className={`trade-button buy ${
            suggested === "BUY" ? "recommended" : ""
          }`}
        >
          BUY
        </button>

        <button
          type="button"
          onClick={() => onTrade("SELL")}
          className={`trade-button sell ${
            suggested === "SELL" ? "recommended" : ""
          }`}
        >
          SELL
        </button>
      </div>

      {/* EVALUATION METRICS */}
      <div className="evaluation-section">
        <h4 className="panel-heading">EVALUATION</h4>

        <div className="metric-row">
          <span>Accuracy</span>

          <strong
            className={
              Number(accuracy) > 60 ? "positive-text" : "negative-text"
            }
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