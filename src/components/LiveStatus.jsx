/**
 * LiveStatus
 *
 * Displays:
 * - Live refresh state
 * - Last update timestamp
 * - Refresh counter
 * - Simulated market open/closed state
 *
 * Designed to resemble financial terminal indicators.
 */

import React from "react";

export default function LiveStatus({
  refreshing,
  lastUpdated,
  refreshCount,
}) {
  /**
   * Simulated market hours.
   * Market considered open between 8 AM and 4 PM.
   */
  const currentHour = new Date().getHours();

  const marketOpen =
    currentHour >= 8 && currentHour <= 16;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
      }}
    >
      {/* MARKET STATUS */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#0f0f0f",
          border: "1px solid #1f1f1f",
          padding: "10px 16px",
          borderRadius: "999px",
        }}
      >
        {/* STATUS DOT */}
        <div
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: marketOpen
              ? "#00ffae"
              : "#ff4d4d",
            boxShadow: marketOpen
              ? "0 0 10px #00ffae"
              : "0 0 10px #ff4d4d",
          }}
        />

        <span
          style={{
            color: marketOpen
              ? "#00ffae"
              : "#ff4d4d",
            fontSize: "13px",
            fontWeight: "bold",
            letterSpacing: "0.5px",
          }}
        >
          {marketOpen
            ? "MARKET OPEN"
            : "MARKET CLOSED"}
        </span>
      </div>

      {/* LIVE REFRESH PANEL */}
      <div
        style={{
          background: "#0f0f0f",
          border: "1px solid #1f1f1f",
          borderRadius: "14px",
          padding: "16px",
          minWidth: "240px",
        }}
      >
        {/* LIVE STATUS */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              color: "#888",
              fontSize: "13px",
            }}
          >
            Data Stream
          </span>

          <strong
            style={{
              color: refreshing
                ? "#ffd166"
                : "#00ffae",
              fontSize: "13px",
            }}
          >
            {refreshing
              ? "Refreshing"
              : "LIVE"}
          </strong>
        </div>

        {/* LAST UPDATE */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              color: "#888",
              fontSize: "13px",
            }}
          >
            Last Update
          </span>

          <strong
            style={{
              color: "white",
              fontSize: "13px",
            }}
          >
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "--"}
          </strong>
        </div>

        {/* REFRESH COUNT */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <span
            style={{
              color: "#888",
              fontSize: "13px",
            }}
          >
            Refresh Count
          </span>

          <strong
            style={{
              color: "white",
              fontSize: "13px",
            }}
          >
            {refreshCount}
          </strong>
        </div>
      </div>
    </div>
  );
}