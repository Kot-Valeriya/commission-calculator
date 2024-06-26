const ComissionStrategy = require('./ComissionStrategy');

class CashInStrategy extends ComissionStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  calculate(amount) {
    const fee = amount * this.config.percents / 100;
    return ComissionStrategy.roundUp(Math.min(fee, this.config.max.amount));
  }
}

module.exports = CashInStrategy;
