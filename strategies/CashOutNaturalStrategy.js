const ComissionStrategy = require('./ComissionStrategy');

class CashOutNaturalStrategy extends ComissionStrategy {
  constructor(config) {
    super();
    this.config = config;
  }

  calculate(amount, exceededAmount) {
    if (exceededAmount > this.config.week_limit.amount) {
      if (exceededAmount - this.config.week_limit.amount < amount) {
        const fee = exceededAmount * this.config.percents / 100;
        return ComissionStrategy.roundUp(fee);
      } else {
        const fee = amount * this.config.percents / 100;
        return ComissionStrategy.roundUp(fee);
      }
    }

    return 0;
  }
}

module.exports = CashOutNaturalStrategy;
