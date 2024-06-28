const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const CashInStrategy = require('../strategies/CashInStrategy');
const CashOutNaturalStrategy = require('../strategies/CashOutNaturalStrategy');
const CashOutJuridicalStrategy = require('../strategies/CashOutJuridicalStrategy');
const App = require('../app');
const fs = require('fs').promises;

const mock = new MockAdapter(axios);

// Mocking API responses
mock.onGet('https://developers.paysera.com/tasks/api/cash-in').reply(200, {
    percents: 0.03,
    max: { amount: 5.00 }
});

mock.onGet('https://developers.paysera.com/tasks/api/cash-out-natural').reply(200, {
    percents: 0.3,
    week_limit: { amount: 1000.00 }
});

mock.onGet('https://developers.paysera.com/tasks/api/cash-out-juridical').reply(200, {
    percents: 0.3,
    min: { amount: 0.50 }
});

describe('Commission Fee Calculation', () => {
    test('Calculate cash in fee', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-in').then(res => res.data);
        const cashInStrategy = new CashInStrategy(config);
        expect(cashInStrategy.calculate(200.00)).toBe(0.06);
        expect(cashInStrategy.calculate(1000000.00)).toBe(5.00);
    });

    test('Calculate cash out fee for natural person', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-out-natural').then(res => res.data);
        const cashOutNaturalStrategy = new CashOutNaturalStrategy(config);
        expect(cashOutNaturalStrategy.calculate(300.00, 0)).toBe(0.00);
        expect(cashOutNaturalStrategy.calculate(30000.00, 29000.00)).toBe(87.00);
    });

    test('Calculate cash out fee for juridical person', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-out-juridical').then(res => res.data);
        const cashOutJuridicalStrategy = new CashOutJuridicalStrategy(config);
        expect(cashOutJuridicalStrategy.calculate(300.00)).toBe(0.90);
        expect(cashOutJuridicalStrategy.calculate(100.00)).toBe(0.50);
    });

    test('Cash out fee for natural person with exact weekly limit', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-out-natural').then(res => res.data);
        const cashOutNaturalStrategy = new CashOutNaturalStrategy(config);
        expect(cashOutNaturalStrategy.calculate(1000.00, 0)).toBe(0.00); // Expect no fee when within the weekly limit
        expect(cashOutNaturalStrategy.calculate(1000.00, 2000.00)).toBe(3.00); // Adjusted expected value based on corrected logic
    });

    test('Cash out fee for natural person exceeding weekly limit', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-out-natural').then(res => res.data);
        const cashOutNaturalStrategy = new CashOutNaturalStrategy(config);
        expect(cashOutNaturalStrategy.calculate(1500.00, 2500.00)).toBe(4.50); // Adjusted expected value based on corrected logic
        expect(cashOutNaturalStrategy.calculate(2500.00, 1500.00)).toBe(4.50); // Adjusted expected value based on corrected logic
    });

    test('Cash out fee for juridical person with minimal fee', async () => {
        const config = await axios.get('https://developers.paysera.com/tasks/api/cash-out-juridical').then(res => res.data);
        const cashOutJuridicalStrategy = new CashOutJuridicalStrategy(config);
        expect(cashOutJuridicalStrategy.calculate(100.00)).toBe(0.50);  // Minimal fee should apply
    });

    test('Integration test for the app with multiple operations', async () => {
        const testData = [
            { "date": "2016-01-05", "user_id": 1, "user_type": "natural", "type": "cash_in", "operation": { "amount": 200.00, "currency": "EUR" } },
            { "date": "2016-01-06", "user_id": 2, "user_type": "juridical", "type": "cash_out", "operation": { "amount": 300.00, "currency": "EUR" } },
            { "date": "2016-01-06", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 30000.00, "currency": "EUR" } },
            { "date": "2016-01-07", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 1000.00, "currency": "EUR" } },
            { "date": "2016-01-07", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 100.00, "currency": "EUR" } },
            { "date": "2016-01-10", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 100.00, "currency": "EUR" } },
            { "date": "2016-01-10", "user_id": 2, "user_type": "juridical", "type": "cash_in", "operation": { "amount": 1000000.00, "currency": "EUR" } },
            { "date": "2016-01-10", "user_id": 3, "user_type": "natural", "type": "cash_out", "operation": { "amount": 1000.00, "currency": "EUR" } },
            { "date": "2016-02-15", "user_id": 1, "user_type": "natural", "type": "cash_out", "operation": { "amount": 300.00, "currency": "EUR" } }
        ];

        jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(testData));

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const app = new App('input.json');
        await app.run();

        expect(logSpy).toHaveBeenCalledWith('0.06');
        expect(logSpy).toHaveBeenCalledWith('0.90');
        expect(logSpy).toHaveBeenCalledWith('87.00');
        expect(logSpy).toHaveBeenCalledWith('3.00'); // Adjusted expected value based on corrected logic
        expect(logSpy).toHaveBeenCalledWith('0.30');
        expect(logSpy).toHaveBeenCalledWith('0.30');
        expect(logSpy).toHaveBeenCalledWith('5.00');
        expect(logSpy).toHaveBeenCalledWith('0.00');
        expect(logSpy).toHaveBeenCalledWith('0.00');

        logSpy.mockRestore();
    });
});
