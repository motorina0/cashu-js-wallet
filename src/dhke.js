const { utils, Point } = require('@noble/secp256k1')
const { bytesToNumber } = require('./utils')

async function hashToCurve(secretMessage) {
    let point
    while (!point) {
        const hash = await utils.sha256(secretMessage)
        try {
            point = Point.fromHex(hash)
        } catch (error) {
            const x = bytesToNumber(hash) + ''
            const msg = await utils.sha256(x)
            secretMessage = utils.bytesToHex(msg)
        }
    }
    return point
}

async function step1Bob(secretMessage) {
    const Y = await hashToCurve(secretMessage)
    const randomBlindingFactor = bytesToNumber(utils.randomPrivateKey())
    const P = Point.fromPrivateKey(randomBlindingFactor)
    const B_ = Y.add(P)
    return { B_, randomBlindingFactor }
}

function step3Bob(C_, r, A) {
    const C = C_.subtract(A.multiply(r))
    return C
}

module.exports = {
    step1Bob,
    step3Bob
}