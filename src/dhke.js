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

// def step1_bob(secret_msg):
//     secret_msg = secret_msg.encode("utf-8")
//     Y = hash_to_curve(secret_msg)
//     r, _ = gen_keypair(secp256k1)
//     B_ = Y + r * G
//     return B_, r

async function step1Bob(secretMessage) {
    const Y = await hashToCurve(secretMessage)
    // const r = utils.randomPrivateKey()
    const randomBlindingFactor = 45943522662364088070039098753115489133214579494806043666244039063376092883740n
    console.log('### r', randomBlindingFactor)
    const P = Point.fromPrivateKey(randomBlindingFactor)
    console.log('### P', P)
    const B_ = Y.add(P)
    console.log('### B_', B_)
    return { B_, randomBlindingFactor }
}







async function test() {
    const p = await step1Bob('153585347535207259782735016770645039724')
    console.log('### p', p)
}

// test()

module.exports = {
    step1Bob
}