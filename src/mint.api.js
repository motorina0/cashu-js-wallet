const axios = require('axios').default;

const mintApi = {
    requestMint: async function (amount) {
        const { data } = await axios.get(`${MINT_SERVER}/mint`, {
            params: {
                amount
            }
        })
        return data
    },
    mint: async function (payloads, paymentHash = '') {
        const { data } = await axios.post(`${MINT_SERVER}/mint`, payloads,
            {
                params: {
                    payment_hash: paymentHash
                }
            })
        return data
    },
}

module.exports = mintApi