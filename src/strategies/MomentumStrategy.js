/**
 * Momentum strategy.
 * Generates a BUY signal when the latest sensor-derived return is positive,
 * a SELL signal when it is negative, and HOLD when there is no movement.
 */

import TradingStrategy from "./TradingStrategy";

export default class MomentumStrategy extends TradingStrategy {
    constructor() {
        super("Momentum");
    }

    generateSignal(data) {
        if (data.length < 2) return "HOLD";
        
        const last = data[data.length - 1];

        if (last.return > 0) return "BUY";
        if (last.return < 0) return "SELL";
        return "HOLD";

    }
}