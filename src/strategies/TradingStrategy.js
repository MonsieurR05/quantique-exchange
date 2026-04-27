export default class TradingStrategy {
    constructor(name) {
        this.name = name;
    }

    generateSignal(data) {
        throw new Error("generateSignal() must be implemented by subclasses");
    }
}