const secp256k1 = require('@noble/secp256k1')

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
    const secrets = []
    const rs = []
    for (let i = 0; i < amounts.length; i++) {
        secret = secp256k1.utils.randomBytes(32)
        secrets.push(secret)
        // B_, r = b_dhke.step1_bob(secret)
    }
}

async function test() {
    const amount = 125
    // const invoice = await mintApi.mint(amount);
    // console.log('### invoice', invoice)
}

test()