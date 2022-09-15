const { utils, Point } = require('@noble/secp256k1')

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


}

function bytesToNumber(bytes) {
    return hexToNumber(utils.bytesToHex(bytes));
}

function hexToNumber(hex) {
    if (typeof hex !== 'string') {
        throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
    }
    return BigInt(`0x${hex}`);
}



hashToCurve('153585347535207259782735016770645039724')

// def hash_to_curve(secret_msg):
//     """Generates x coordinate from the message hash and checks if the point lies on the curve.
//     If it does not, it tries computing again a new x coordinate from the hash of the coordinate."""
//     point = None
//     msg = secret_msg
//     while point is None:
//         x_coord = int(hashlib.sha256(msg).hexdigest().encode("utf-8"), 16)
//         y_coord = secp256k1.compute_y(x_coord)
//         try:
//             # Fails if the point is not on the curve
//             point = Point(x_coord, y_coord, secp256k1)
//         except:
//             msg = str(x_coord).encode("utf-8")

//     return point