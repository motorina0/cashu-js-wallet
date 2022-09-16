# cashu-js-wallet

[Blind Diffie-Hellman Key Exchange (blind ecash)](https://gist.github.com/RubenSomsen/be7a4760dd4596d06963d67baf140406)

### Mint (Alice)
```
A = a*G
return A
```

### Client (Bob)
```
    secretMessage = choosen by the user, but must be hard to guess
    Y = hashToCurve(secretMessage) // a Point on the curve
    r = random blinding factor
    B' = Y + r*G // a Point on the curce
    return B'
```

### Mint (Alice)
- if some conditions are met (invoice paied for example) then: 
```
    C' = a * B' = a * (Y + r*G)
    return C'
```

### Client (Bob)
- stores this data. It represents eCash tokens
- it proves the invoice was paid
- if lost or stollen (copied and spent by a mallcious 3rd party) the tokens cannot be accessed anymore
```
    C = C' - r*A =  a * (Y + r*G) - r*A = a*Y - a*r*G - r*A = a*Y - r*A - r*A = a*Y
```

### Client (Bob)
 - makes a payment with another `Mint` Client (Carol) by sharing this data: 

```
   return (C, secretMessage)
```

### Client (Carol)
 - redeems the funds by sending `(C, secretMessage)` to the `Mint`

### Mint (Alice)
  - checks if the redeem data is valid (it was signed by the `Mint`)

```
    Y = hashToCurve(secretMessage)
    if (C == a*Y) return true
```

### Client (Carol)
 - has ownership of the tokens now