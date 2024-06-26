const Config = require('./config/Config');
const CashInStrategy = require('./CashInStrategy');
const CashOutNaturalStrategy = require('./CashOutNaturalStrategy');
const CashOutJuridicalStrategy = require('./CashOutJuridicalStrategy');

class OperationFactory {
   static async createStrategy(type, userType) {
       if (type === 'cash_in') {
           const config = await Config.getCashInConfig();
           return new CashInStrategy(config);
       }
       if (type === 'cash_out' && userType === 'natural') {
           const config = await Config.getCashOutNaturalConfig();
           return new CashOutNaturalStrategy(config);
       }
       if (type === 'cash_out' && userType === 'juridical') {
           const config = await Config.getCashOutJuridicalConfig();
           return new CashOutJuridicalStrategy(config);
       }
       throw new Error('Invalid operation type or user type');
   }
}

module.exports = OperationFactory;
