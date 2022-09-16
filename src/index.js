const secp256k1 = require('@noble/secp256k1')
const dhke = require('./dhke')
const mintApi = require('./mint.api')
const { splitAmount, bytesToNumber, bigIntStringify } = require('./utils')

MINT_HOST = '127.0.0.1'
MINT_PORT = 3338
MINT_SERVER = `http://${MINT_HOST}:${MINT_PORT}`

async function requestMint(amount) {
    const invoice = await mintApi.requestMint(amount);
    return invoice
}


async function mint(amounts, paymentHash) {
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
    return _constructProofs(promises, randomBlindingFactors, secrets)
}

function _constructProofs(promises, randomBlindingFactors, secrets) {
    return promises.map((p, i) => {
        const C_ = new secp256k1.Point(BigInt(p["C'"].x), BigInt(p["C'"].y))
        const A = keys[p.amount]
        C = dhke.step3Bob(C_, randomBlindingFactors[i], new secp256k1.Point(BigInt(A.x), BigInt(A.y)))
        return {
            amount: p.amount,
            C: { x: C.x, y: C.y, secret: secrets[i] }
        }
    })
}


let keys = []
async function run() {
    keys = await mintApi.getKeys()
    const command = process.argv[2]
    switch (command) {
        case 'mint':
            const amount = +process.argv[3]
            const hash = process.argv[4]
            await executeMintCommand(amount, hash)
            break;
        default:
            console.log(`Command '${command}' not supported`)
            break;
    }
}

async function executeMintCommand(amount, hash) {
    try {
        if (!amount || !Number.isInteger(amount)) {
            console.log('amount value missing')
            return
        }
        if (!hash) {
            const invoice = await requestMint(amount)
            console.log(invoice)
        } else {
            const amounts = splitAmount(amount)
            const proofs = await mint(amounts, hash)
            console.log(proofs)
        }
    } catch (error) {
        console.log("Failed to execute 'mint' command")
        console.error(error)
    }

}


try {
    run()
} catch (error) {
    console.log(error)
}