const axios = require('axios').default;

const mintApi = {
    mint: async function (amount) {
        return axios.get(`${MINT_SERVER}/mint`, {
            params: {
                amount
            }
        })
    }
}

module.exports = mintApi