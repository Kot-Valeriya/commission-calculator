class User {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.cashOutThisWeek = 0;
    this.lastOperationWeek = null;
  }

  updateWeeklyLimit(currentWeek, amount) {
  if (this.lastOperationWeek !== currentWeek) {
      this.cashOutThisWeek = 0;
      this.lastOperationWeek = currentWeek;
    } else {
      this.cashOutThisWeek += amount;
    }
  }
}

module.exports = User;
