/**
 * MovingAverageStrategy
 *
 * Generates a trading signal by comparing the latest value
 * against the recent moving average.
 */

import TradingStrategy from "./TradingStrategy";

export default class MovingAverageStrategy extends TradingStrategy {
  constructor(window = 10) {
    super("Moving Average");
    this.window = window;
  }

  generateSignal(data) {
    if (!data || data.length < this.window) {
      return "HOLD";
    }

    const recentData = data.slice(-this.window);
    const latest = recentData[recentData.length - 1];

    const average =
      recentData.reduce((sum, reading) => sum + Number(reading.value), 0) /
      recentData.length;

    if (latest.value > average) {
      return "BUY";
    }

    if (latest.value < average) {
      return "SELL";
    }

    return "HOLD";
  }
}