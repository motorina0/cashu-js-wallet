const secp256k1 = require('@noble/secp256k1')
const dhke = require('./dhke')
const mintApi = require('./mint.api')
const { splitAmount, bytesToNumber, bigIntStringify } = require('./utils')

MINT_HOST = '127.0.0.1'
MINT_PORT = 3338
MINT_SERVER = `http://${MINT_HOST}:${MINT_PORT}`

// def mint(self, amounts, payment_hash=None):
//     """Mints new coins and returns a proof of promise."""
//     payloads: MintPayloads = MintPayloads()
//     secrets = []
//     rs = []
//     for i, amount in enumerate(amounts):
//         secret = str(random.getrandbits(128))
//         print('### secret', secret)
//         secrets.append(secret)
//         B_, r = b_dhke.step1_bob(secret)
//         rs.append(r)
//         blinded_point = BasePoint(x=str(B_.x), y=str(B_.y))
//         payload: MintPayload = MintPayload(amount=amount, B_=blinded_point)
//         payloads.payloads.append(payload)
//     promises = requests.post(
//         self.url + "/mint",
//         json=payloads.dict(),
//         params={"payment_hash": payment_hash},
//     ).json()
//     print('### promises: ', promises)
//     if "error" in promises:
//         raise Exception("Error: {}".format(promises["error"]))
//     return self._construct_proofs(promises, [(r, s) for r, s in zip(rs, secrets)])


async function mint(amounts, paymentHash) {
    const payloads = []
    const secrets = []
    const randomBlindingFactors = []
    for (let i = 0; i < amounts.length; i++) {
        const rb = secp256k1.utils.randomBytes(32)
        // const secret = bytesToNumber(rb)
        const secret = '153585347535207259782735016770645039724'
        secrets.push(secret)
        const { B_, randomBlindingFactor } = await dhke.step1Bob(secret)
        console.log('### B_1:', B_)
        randomBlindingFactors.push(randomBlindingFactor)
        payloads.push({ amount: amounts[i], B_: { x: B_.x, y: B_.y } })
    }
    const payloadsJson = JSON.parse(JSON.stringify({ payloads }, bigIntStringify))
    const promises = await mintApi.mint(payloadsJson, paymentHash)
    console.log('### mint resp', promises)
    // console.log('### payloads', JSON.stringify({ payloads }, bigIntStringify))
}

async function test() {
    const amount = 125
    // const invoice = await mintApi.requestMint(amount);
    // console.log('### invoice', invoice)
    try {
        const amounts = splitAmount(amount)
        const x = await mint(amounts, 'c8d167d0e1c62c23f85506ba87712be2753afbd7d189ca7d0ed433acdf0aada5')
    } catch (error) {
        console.log(error)
    }

}

test()