# node-przelewy24
This library provides integration access to Przelewy24 API withing NodeJS

## Requirements
You might need Node.js with version 9.x+ with "--experimental-modules" flag, as this wrapper uses async/await functions.<br>
Example: `node --experimental-modules index.mjs`

## Installation

### NPM
`npm install node-przelewy24`

## Usage

### Registering new order
```
import Przelewy24 from 'node-przelewy24'

async function createPayment() {
    const P24 = new Przelewy24('MERCHANT_ID', 'POS_ID', 'SALT', false)

    // Set obligatory data
    P24.setSessionId('nodeapitest1')
    P24.setAmount(5.50 * 100)
    P24.setCurrency('PLN')
    P24.setDescription('Simple payment.')
    P24.setEmail('test@gmail.com')
    P24.setCountry('PL')
    P24.setUrlStatus('https://myshop.com/api/v1/store/callback_p24')
    P24.setUrlReturn('https://myshop.com')
    
    // What about adding some products?
    P24.addProduct('Product no.1', 'Product description', 1, 1.20 * 100)
    P24.addProduct('Product no.2', null, 2, 5 * 100)
    P24.addProduct('Product no.3', null, 1, 9.20 * 100, '20202')

    // Register our order
    try {
        const token = await P24.register()
        const url = P24.getPayByLinkUrl(token)

        console.log(url)
    } catch (e) {
        console.log(e.message)
    }
}

createPayment()
```

### Verifying order status update (callback)
```
import Przelewy24 from 'node-przelewy24'

const P24_TRUST_IPS = ['91.216.191.181', '91.216.191.182', '91.216.191.183', '91.216.191.184', '91.216.191.185']

const callbackP24 = async (req, res, next) => {
    if (P24_TRUST_IPS.indexOf(req.headers['x-real-ip']) === -1) {
        return next(new Error('Unauthorized IP address'))
    }

    const { p24_session_id, p24_amount, p24_currency, p24_order_id, p24_sign } = req.body

    const P24 = new Przelewy24('MERCHANT_ID', 'POS_ID', 'SALT', false)

    P24.setSessionId(p24_session_id)
    P24.setAmount(p24_amount)
    P24.setCurrency(p24_currency)
    P24.setOrderId(p24_order_id)

    try {
        await P24.verify(p24_sign)

        return res.send('OK')
    } catch (e) {
        return next(e)
    }
}
```
