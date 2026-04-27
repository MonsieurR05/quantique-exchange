// -----------------------------
// SIGNAL COLOR
// Gives each trading signal a visual colour.
// -----------------------------
export const getSignalColor = (signal) => {
  if (signal === "BUY") return "#00ff9f";
  if (signal === "SELL") return "#ff4d4d";
  return "#aaa";
};