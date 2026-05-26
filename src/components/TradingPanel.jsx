/**
 * TradingPanel
 *
 * Displays:
 * - Current simulated market price
 * - Trading strategy signals
 * - Suggested trading action
 * - Portfolio balance
 * - Asset value
 * - Total equity
 * - Current trading position
 * - BUY and SELL controls
 * - Evaluation metrics
 *
 * Includes:
 * - Custom financial tooltips
 * - Bloomberg-style layout
 * - Portfolio analytics
 */

import React, { useEffect, useState } from "react";

import InfoTooltip from "./InfoTooltip";
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
  portfolioValue,
  totalEquity,
}) {
  /**
   * Tracks latest displayed price to animate changes.
   */
  const [previousPrice, setPreviousPrice] =
    useState(null);

  /**
   * Determines whether latest price increased or decreased.
   */
  const [priceDirection, setPriceDirection] =
    useState("neutral");

  /**
   * Detects price movement direction.
   */
  useEffect(() => {
    if (
      previousPrice !== null &&
      latest?.value !== undefined
    ) {
      if (latest.value > previousPrice) {
        setPriceDirection("up");
      } else if (
        latest.value < previousPrice
      ) {
        setPriceDirection("down");
      }
    }

    if (latest?.value !== undefined) {
      setPreviousPrice(latest.value);
    }
  }, [latest?.value, previousPrice]);

  /**
   * Calculates unrealised profit/loss.
   */
  const unrealisedPnL =
    totalEquity - 10000;

  return (
    <aside className="right-panel">
      <h4 className="panel-heading">
        TRADING PANEL
      </h4>

      {/* ASSET INFORMATION */}
      <div className="metric-card">
        <div className="metric-row">
          <span>
            Selected Asset
            <InfoTooltip text="Currently selected simulated market asset." />
          </span>

          <strong>
            {displayName || selectedSensor}
          </strong>
        </div>

        {selectedSensor && (
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              marginTop: "6px",
              marginBottom: "10px",
            }}
          >
            [{selectedSensor}]
          </div>
        )}

        <div className="metric-row">
          <span>
            Market Price
            <InfoTooltip text="Current simulated market value generated from live IoT activity." />
          </span>

          <strong
            style={{
              color:
                priceDirection === "up"
                  ? "#00ffae"
                  : priceDirection === "down"
                  ? "#ff4d4d"
                  : "white",

              transition: "0.2s ease",
            }}
          >
            ${latest?.value?.toFixed(2) ?? "-"}
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Return
            <InfoTooltip text="Percentage movement between recent market values." />
          </span>

          <strong>
            {latest?.return?.toFixed(2) ?? "-"}
          </strong>
        </div>
      </div>

      {/* PORTFOLIO SECTION */}
      <div className="metric-card">
        <div className="metric-row">
          <span>
            Portfolio Balance
            <InfoTooltip text="Remaining simulated trading capital available for new trades." />
          </span>

          <strong>
            ${balance?.toFixed(2)}
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Owned Shares
            <InfoTooltip text="Number of shares currently owned for this asset." />
          </span>

          <strong>
            {portfolio?.[selectedSensor] || 0}
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Asset Value
            <InfoTooltip text="Current value of owned shares based on live market price." />
          </span>

          <strong>
            ${portfolioValue?.toFixed(2)}
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Total Equity
            <InfoTooltip text="Combined value of portfolio balance and owned assets." />
          </span>

          <strong>
            ${totalEquity?.toFixed(2)}
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Unrealised P/L
            <InfoTooltip text="Current simulated profit or loss compared to the initial portfolio balance." />
          </span>

          <strong
            style={{
              color:
                unrealisedPnL >= 0
                  ? "#00ffae"
                  : "#ff4d4d",
            }}
          >
            {unrealisedPnL >= 0 ? "+" : "-"}$
            {Math.abs(
              unrealisedPnL
            ).toFixed(2)}
          </strong>
        </div>
      </div>

      {/* STRATEGY SIGNALS */}
      <div className="signal-list">
        {signals.map(({ name, signal }) => (
          <div
            key={name}
            className="signal-row"
          >
            <span>
              {name}

              <InfoTooltip
                text={
                  name === "Momentum"
                    ? "Measures upward or downward market movement trends."
                    : name ===
                      "Moving Average"
                    ? "Uses rolling averages to smooth price movement and identify trends."
                    : "Detects imbalance between simulated buying and selling pressure."
                }
              />
            </span>

            <strong
              style={{
                color:
                  getSignalColor(signal),
              }}
            >
              {signal}
            </strong>
          </div>
        ))}
      </div>

      {/* PRIMARY RECOMMENDATION */}
      <div className="suggested-card">
        <span>
          Suggested Action
          <InfoTooltip text="Primary recommendation generated from active trading strategies." />
        </span>

        <strong
          style={{
            color:
              getSignalColor(suggested),
            fontSize: "18px",
          }}
        >
          {suggested}
        </strong>
      </div>

      {/* CURRENT POSITION */}
      <div className="position-row">
        <span>
          Current Position
          <InfoTooltip text="Latest BUY or SELL action executed by the user." />
        </span>

        <strong>
          {position || "NONE"}
        </strong>
      </div>

      {/* TRADING CONTROLS */}
      <div className="trade-buttons">
        <button
          type="button"
          onClick={() => onTrade("BUY")}
          className={`trade-button buy ${
            suggested === "BUY"
              ? "recommended"
              : ""
          }`}
          style={{
            flex: 1,
            background:
              suggested === "BUY"
                ? "#00ffae"
                : "#111",
            color:
              suggested === "BUY"
                ? "black"
                : "white",
            border: "1px solid #222",
            padding: "14px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          BUY
        </button>

        <button
          type="button"
          onClick={() => onTrade("SELL")}
          className={`trade-button sell ${
            suggested === "SELL"
              ? "recommended"
              : ""
          }`}
          style={{
            flex: 1,
            background:
              suggested === "SELL"
                ? "#ff4d4d"
                : "#111",
            color: "white",
            border: "1px solid #222",
            padding: "14px",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          SELL
        </button>
      </div>

      {/* EVALUATION METRICS */}
      <div className="evaluation-section">
        <h4 className="panel-heading">
          EVALUATION
        </h4>

        <div className="metric-row">
          <span>
            Accuracy
            <InfoTooltip text="Percentage of positive directional market predictions." />
          </span>

          <strong
            style={{
              color:
                Number(accuracy) > 60
                  ? "#00ffae"
                  : "#ff4d4d",
            }}
          >
            {accuracy}%
          </strong>
        </div>

        <div className="metric-row">
          <span>
            Signal Strength
            <InfoTooltip text="Measures how strongly the market price is moving over time." />
          </span>

          <strong>
            {strength}
          </strong>
        </div>
      </div>
    </aside>
  );
}