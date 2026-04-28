/**
 * Base class for all trading strategies.
 * Each strategy must implement generateSignal() and return BUY, SELL, or HOLD.
 * This shared interface allows the dashboard to run different strategies in the same way.
 */

export default class TradingStrategy {
    constructor(name) {
        this.name = name;
    }

    generateSignal(data) {
        throw new Error("generateSignal() must be implemented by subclasses");
    }
}