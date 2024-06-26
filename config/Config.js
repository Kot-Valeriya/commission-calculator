const axios = require('axios');

class Config {
    static async fetchConfigs(url) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Error fetching configuration from ${url}:`, error);
            throw error;
        }
    }

    static async getCashInConfig() {
        return await Config.fetchConfigs('https://developers.paysera.com/tasks/api/cash-in');
    }

    static async getCashOutNaturalConfig() {
        return await Config.fetchConfigs('https://developers.paysera.com/tasks/api/cash-out-natural');
    }

    static async getCashOutJuridicalConfig() {
        return await Config.fetchConfigs('https://developers.paysera.com/tasks/api/cash-out-juridical');
    }
}

module.exports = Config;
