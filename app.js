const fs = require('fs').promises;
const OperationFactory = require('./OperationFactory');
const User = require('./User');
const {OperationType, UserType} = require("./constants");

class App {
    constructor(filePath) {
        this.filePath = filePath;
        this.users = new Map();
    }

    static getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getUser(id, type) {
        if (!this.users.has(id)) {
            this.users.set(id, new User(id, type));
        }
        return this.users.get(id);
    }

    async processOperation(operation) {
        const {user_id, user_type, type, date, operation: {amount}} = operation;
        const user = this.getUser(user_id, user_type);
        const currentWeek = App.getWeekNumber(new Date(operation.date));

        let fee = 0;

        user.updateWeeklyLimit(currentWeek, amount);
        const exceededAmount = type === OperationType.CASH_OUT && user_type === UserType.NATURAL
            ? Math.max(0, user.cashOutThisWeek - 1000)
            : 0;

        const strategy = await OperationFactory.createStrategy(type, user_type);
        fee = strategy.calculate(amount, exceededAmount);

        return fee.toFixed(2);
    }

    async run() {
        try {
            const data = JSON.parse(await fs.readFile(this.filePath, 'utf8'));

            for (const operation of data) {
                const fee = await this.processOperation(operation);
                console.log(fee);
            }
        } catch (error) {
            console.error('Error processing file:', error);
        }
    }
}

    const [,, filePath] = process.argv;

    if (filePath) {
        const app = new App(filePath);
        app.run();
    } else {
    console.error('Please provide a path to the input file.');
}
