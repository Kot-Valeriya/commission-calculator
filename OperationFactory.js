const Config = require('./config/Config');
const CashInStrategy = require('./strategies/CashInStrategy');
const CashOutNaturalStrategy = require('./strategies/CashOutNaturalStrategy');
const CashOutJuridicalStrategy = require('./strategies/CashOutJuridicalStrategy');
const { OperationType, UserType } = require('./constants');

class OperationFactory {
    static strategiesMap = new Map([
        [OperationType.CASH_IN, async () => {
            const config = await Config.getCashInConfig();
            return new CashInStrategy(config);
        }],
        [OperationType.CASH_OUT, new Map([
            [UserType.NATURAL, async () => {
                const config = await Config.getCashOutNaturalConfig();
                return new CashOutNaturalStrategy(config);
            }],
            [UserType.JURIDICAL, async () => {
                const config = await Config.getCashOutJuridicalConfig();
                return new CashOutJuridicalStrategy(config);
            }]
        ])]
    ]);

    static async createStrategy(type, userType) {
        const strategy = this.strategiesMap.get(type);

        if (!strategy) {
            throw new Error('Invalid operation type');
        }

        if (type === OperationType.CASH_OUT) {
            const userStrategy = strategy.get(userType);
            if (!userStrategy) {
                throw new Error('Invalid user type for cash out operation');
            }
            return userStrategy();
        }

        return strategy();
    }
}

module.exports = OperationFactory;
