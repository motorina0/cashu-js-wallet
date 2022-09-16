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
    const randomBlindingFactor = utils.randomPrivateKey()
    const P = Point.fromPrivateKey(randomBlindingFactor)
    const B_ = Y.add(P)
    return { B_, randomBlindingFactor }
}

function step3Bob(C_, r, A) {
    const C = C_.subtract(A.multiply(r))
    return C
}



// C_, r, A 
// Point(X=615767889524039689842156923187873247611365038374139947505106220624651423592, Y=33505505104628066149405558131997491841339179075956547982586179135884422222129, Curve=secp256k1) 
// 55006952287312189738450998181687011114238248877893756042708238741377669952509 
// Point(X=111774593571672705200679076796744723913503290165769644787497767837866218834173, Y=21053940047267439704023547201053375178584459400220021798114289504581792085990, Curve=secp256k1)
// Point(X=7733530216519674695793492633867773352991205220864822865731775920662758973647, Y=73573360236782530310719213747560508505311978906583938131478206386519064756389, Curve=secp256k1)
async function test() {
    // const p = await step1Bob('153585347535207259782735016770645039724')
    // console.log('### p', p)

    const C_ = new Point(615767889524039689842156923187873247611365038374139947505106220624651423592n, 33505505104628066149405558131997491841339179075956547982586179135884422222129n)
    const r = 55006952287312189738450998181687011114238248877893756042708238741377669952509n
    const A = new Point(111774593571672705200679076796744723913503290165769644787497767837866218834173n, 21053940047267439704023547201053375178584459400220021798114289504581792085990n)
    const C = step3Bob(C_, r, A)
    console.log('### C', C)
}

// test()

module.exports = {
    step1Bob,
    step3Bob
}