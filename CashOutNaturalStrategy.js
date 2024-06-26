const ComissionStrategy = require('./ComissionStrategy');

class CashOutNaturalStrategy extends ComissionStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  calculate(amount, exceededAmount) {
    const fee = exceededAmount * this.config.percents / 100;
    return ComissionStrategy.roundUp(fee);
  }
}

module.exports = CashOutNaturalStrategy;
