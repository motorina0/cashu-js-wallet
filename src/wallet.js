const secp256k1 = require('@noble/secp256k1')
const mintApi = require('./mint.api')
const dhke = require('./dhke')
const { splitAmount, bytesToNumber, bigIntStringify } = require('./utils')

class Wallet {
    constructor(keys) {
        this.keys = keys
    }

    async requestMint(amount) {
        const invoice = await mintApi.requestMint(amount);
        return invoice
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

    async requestTokens(amounts, paymentHash) {
        const payloads = []
        const secrets = []
        const randomBlindingFactors = []
        for (let i = 0; i < amounts.length; i++) {
            const rb = secp256k1.utils.randomBytes(32)
            const secret = bytesToNumber(rb) + ''
            secrets.push(secret)
            const { B_, randomBlindingFactor } = await dhke.step1Bob(secret)
            randomBlindingFactors.push(randomBlindingFactor)
            payloads.push({ amount: amounts[i], B_: { x: B_.x, y: B_.y } })
        }
        const payloadsJson = JSON.parse(JSON.stringify({ payloads }, bigIntStringify))
        const promises = await mintApi.mint(payloadsJson, paymentHash)
        if (promises.error) {
            throw new Error(promises.error)
        }
        return this._constructProofs(promises, randomBlindingFactors, secrets)
    }

    _constructProofs(promises, randomBlindingFactors, secrets) {
        return promises.map((p, i) => {
            const C_ = new secp256k1.Point(BigInt(p["C'"].x), BigInt(p["C'"].y))
            const A = this.keys[p.amount]
            const C = dhke.step3Bob(C_, randomBlindingFactors[i], new secp256k1.Point(BigInt(A.x), BigInt(A.y)))
            return {
                amount: p.amount,
                C: { x: C.x, y: C.y, secret: secrets[i] }
            }
        })
    }
}



module.exports = Wallet