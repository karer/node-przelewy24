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
    const P24 = new Przelewy24('CLIENT_ID', 'CLIENT_ID', 'CLIENT_CRC', false)

    // Set obligatory data
    P24.setSessionId('nodeapitest1')
    P24.setAmount(5.50 * 100)
    P24.setCurrency('PLN')
    P24.setDescription('Simple payment.')
    P24.setEmail('test@test.pl')
    P24.setCountry('PL')
    P24.setUrlReturn('https://google.pl/')
    
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

### Verifying order status update
```
import Przelewy24 from 'node-przelewy24'

async function checkPayment() {
    const P24 = new Przelewy24('CLIENT_ID', 'CLIENT_ID', 'CLIENT_CRC', false)

    // Set obligatory data
    P24.setSessionId('nodeapitest1')
    P24.setAmount(5.50 * 100)
    P24.setCurrency('PLN')
    P24.setOrderId('order-id-from-p24-status-update')

    // Verify our order
    try {
        await P24.verify()

        console.log('Paid')
    } catch (e) {
        console.log(e.message)
    }
}

checkPayment()
```
