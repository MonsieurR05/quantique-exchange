/**
 * InfoTooltip
 *
 * Reusable tooltip component used to explain
 * financial terminology throughout the dashboard.
 */

import React, { useState } from "react";

export default function InfoTooltip({ text }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* INFO ICON */}
      <span
        style={{
          marginLeft: "6px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "1px solid #666",
          color: "#aaa",
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "help",
          transition: "0.2s ease",
        }}
      >
        ?
      </span>

      {/* TOOLTIP BUBBLE */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "0",
            width: "220px",
            background: "#111",
            color: "#fff",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            fontSize: "12px",
            lineHeight: "1.5",
            zIndex: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
}