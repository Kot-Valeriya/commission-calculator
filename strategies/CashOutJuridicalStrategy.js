const ComissionStrategy = require('./ComissionStrategy');

class CashOutJuridicalStrategy extends ComissionStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  calculate(amount) {
    const fee = amount * this.config.percents / 100;
    return ComissionStrategy.roundUp(Math.max(fee, this.config.min.amount));
  }
}

module.exports = CashOutJuridicalStrategy;
