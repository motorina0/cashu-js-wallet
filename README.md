# cashu-js-wallet

[Blind Diffie-Hellman Key Exchange (blind ecash)](https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406)

## Steps
### 1. Mint (Alice)
 - generates a key-pair (private, public) and makes the public key available to its `Clients`
   - there can be more key-pairs, each one being used for a fixed, power of `2` amount (`1`, `2`, `4`, `8` ... `9223372036854775808`)
```
A = a*G
return A                                // all clients can see this
```

### 2. Client (Bob)
```
    secretMessage = choosen by the user, but must be hard to guess
    Y = hashToCurve(secretMessage)      // a Point on the curve
    r = random blinding factor          // a valid private key
    B' = Y + r*G                        // a Point on the curve
    return B'
```

### 3. Mint (Alice)
- if some conditions are met (invoice paid for example) then the `Mint` "signs":
```
    C' = a * B' = a * (Y + r*G)
    return C'
```

### 4. Client (Bob)
- stores this data. It represents eCash tokens
- it proves the invoice was paid
- if lost or stolen the tokens cannot be accessed anymore
```
    C = C' - r*A                        // remove the blinding factor
      = a * (Y + r*G) - r*A 
      = a*Y - a*r*G - r*A = a*Y - r*A - r*A
      = a*Y                             // proves that the `Mint` has "signed"
```

### 5. Client (Bob)
 - makes a payment to another `Mint` Client (Carol) by sharing this data somehow: 

```
   return (C, secretMessage)
```

### 6. Client (Carol)
 - redeems the funds by sending `(C, secretMessage)` to the `Mint`

### 7. Mint (Alice)
  - checks if the redeem data is valid (it was signed by the `Mint`)
  - if true, it releases the funds to `Carol`

```
    Y = hashToCurve(secretMessage)
    if (C == a*Y) return true
```

### 8. Client (Carol)
 - has ownership of the tokens now
