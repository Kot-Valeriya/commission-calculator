class ComissionStrategy {
  constructor() {
    if (new.target === ComissionStrategy) {
      throw new TypeError("Cannot construct ComissionStrategy instance directly");
    }
  }

  calculate() {
    throw new Error("Calculate method must be implemented");

  }

  static roundUp(amount) {
    return Math.ceil(amount * 100) / 100;
  }
}

module.exports = ComissionStrategy;
