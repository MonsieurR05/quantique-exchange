import TradingStrategy from "./TradingStrategy";

export default class MomentumStrategy extends TradingStrategy {
    constructor(window = 10) {
        super("Moving Average");
        this.window = window;
    }

    generateSignal(data) {
        if (data.length < this.window) return "HOLD";   

        const slice = data.slice(-this.window);
        const avg = slice.reduce((sum, d) => sum + d.value, 0) / this.window;

        const latest = data[data.length - 1].value;

        if (latest > avg) return "BUY";
        if (latest < avg) return "SELL";
        return "HOLD";
    }
}  