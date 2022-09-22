const { utils, Point } = require('@noble/secp256k1')
const mintApi = require('./mint.api')
const dhke = require('./dhke')
const { splitAmount, bytesToNumber, bigIntStringify } = require('./utils')

class Wallet {
    constructor(keys) {
        this.keys = keys
    }

    async mint(amount, hash) {
        try {
            if (!amount || !Number.isInteger(amount)) {
                console.log('amount value missing')
                return
            }
            if (hash) {
                const amounts = splitAmount(amount)
                const proofs = await this.requestTokens(amounts, hash)
                return proofs
            }
            const invoice = await this.requestMint(amount)
            return invoice
        } catch (error) {
            console.log("Failed to execute 'mint' command")
            console.error(error)
        }
    }

    async requestMint(amount) {
        const invoice = await mintApi.requestMint(amount);
        return invoice
    }

    async requestTokens(amounts, paymentHash) {
        const payloads = {blinded_messages : []}
        const secrets = []
        const randomBlindingFactors = []
        for (let i = 0; i < amounts.length; i++) {
            const secret = bytesToNumber(utils.randomBytes(32)) + ''
            secrets.push(secret)
            const { B_, randomBlindingFactor } = await dhke.step1Bob(secret).toHex()
            randomBlindingFactors.push(randomBlindingFactor)
            payloads.blinded_messages.push({ amount: amounts[i], B_: B_ })
        }
        const payloadsJson = JSON.parse(JSON.stringify({ payloads }, bigIntStringify))
        const promises = await mintApi.mint(payloadsJson.payloads, paymentHash)
        if (promises.error) {
            throw new Error(promises.error)
        }
        return this._constructProofs(promises, randomBlindingFactors, secrets)
    }

    _constructProofs(promises, randomBlindingFactors, secrets) {
        return promises.map((p, i) => {
            const C_ = Point.fromHex(p["C_"])
            const A = this.keys[p.amount]
            const C = dhke.step3Bob(C_, randomBlindingFactors[i], Point.fromHex(A)).toHex()
            return {
                amount: p.amount,
                C: { C, secret: secrets[i] }
            }
        })
    }
}



module.exports = Wallet