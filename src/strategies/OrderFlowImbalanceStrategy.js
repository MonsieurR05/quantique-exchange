/**
 * Simplified order-flow imbalance strategy.
 * Since this project uses IoT sensor data instead of real market orders,
 * this strategy compares recent upward and downward movements.
 */

import TradingStrategy from "./TradingStrategy";

export default class OrderFlowImbalanceStrategy extends TradingStrategy {
  constructor(window = 10) {
    super("Order Flow Imbalance");
    this.window = window;
  }

  generateSignal(data) {
    if (data.length < this.window) return "HOLD";

    const recent = data.slice(-this.window);

    const upwardMoves = recent.filter((d) => d.return > 0).length;
    const downwardMoves = recent.filter((d) => d.return < 0).length;

    if (upwardMoves > downwardMoves) return "BUY";
    if (downwardMoves > upwardMoves) return "SELL";
    return "HOLD";
  }
}