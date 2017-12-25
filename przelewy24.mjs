import request from 'request-promise-native'
import crypto from 'crypto'
import queryString from 'query-string'

export default class Przelewy24 {
    constructor(merchantId, posId, salt, testMode = false) {
        this.form = {
            p24_merchant_id: merchantId,
            p24_pos_id: posId,
            p24_api_version: this.P24_VERSION
        }

        this.salt = salt
        this.testMode = testMode

        this.host = testMode ? this.HOST_DEMO : this.HOST_LIVE
        this.products = []
    }

    // Constants
    get P24_VERSION() {
        return '3.2'
    }

    get HOST_LIVE() {
        return 'https://secure.przelewy24.pl/'
    }

    get HOST_DEMO() {
        return 'https://sandbox.przelewy24.pl/'
    }

    get REQUIRED_FIELDS_REGISTER() {
        return ['p24_merchant_id', 'p24_pos_id', 'p24_session_id', 'p24_amount', 'p24_currency', 'p24_description', 'p24_email', 'p24_country', 'p24_url_return']
    }

    get REQUIRED_FIELDS_VERIFY() {
        return ['p24_merchant_id', 'p24_pos_id', 'p24_session_id', 'p24_amount', 'p24_currency', 'p24_order_id']
    }

    // Field-filing methods
    setSessionId(value) {
        if (value.length === 0 || value.length > 100) {
            throw new Error('p24_session_id value must have from 0 to 100 characters.')
        }

        this.form.p24_session_id = value
    }

    setAmount(value) {
        this.form.p24_amount = value
    }

    setCurrency(value) {
        if (value.length !== 3) {
            throw new Error('p24_currency value must have from 3 characters.')
        }

        this.form.p24_currency = value
    }

    setDescription(value) {
        if (value.length === 0 || value.length > 1024) {
            throw new Error('p24_description value must have from 0 to 1024 characters.')
        }

        this.form.p24_description = value
    }

    setEmail(value) {
        if (value.length === 0 || value.length > 50) {
            throw new Error('p24_email value must have from 0 to 50 characters.')
        }

        this.form.p24_email = value
    }

    setClient(value) {
        if (value.length === 0 || value.length > 50) {
            throw new Error('p24_client value must have from 0 to 50 characters.')
        }

        this.form.p24_client = value
    }

    setAddress(value) {
        if (value.length === 0 || value.length > 80) {
            throw new Error('p24_address value must have from 0 to 80 characters.')
        }

        this.form.p24_address = value
    }

    setZip(value) {
        if (value.length === 0 || value.length > 10) {
            throw new Error('p24_zip value must have from 0 to 10 characters.')
        }

        this.form.p24_zip = value
    }

    setCity(value) {
        if (value.length === 0 || value.length > 50) {
            throw new Error('p24_city value must have from 0 to 50 characters.')
        }

        this.form.p24_city = value
    }

    setCountry(value) {
        if (value.length === 0 || value.length > 2) {
            throw new Error('p24_country value must have from 0 to 2 characters.')
        }

        this.form.p24_country = value
    }

    setPhone(value) {
        if (value.length === 0 || value.length > 12) {
            throw new Error('p24_phone value must have from 0 to 12 characters.')
        }

        this.form.p24_phone = value
    }

    setLanguage(value) {
        if (value.length !== 2) {
            throw new Error('p24_language value must have from 2 characters.')
        }

        this.form.p24_language = value
    }

    setMethod(value) {
        this.form.p24_method = value
    }

    setUrlReturn(value) {
        if (value.length === 0 || value.length > 250) {
            throw new Error('p24_url_return value must have from 0 to 250 characters.')
        }

        this.form.p24_url_return = value
    }

    setUrlStatus(value) {
        if (value.length === 0 || value.length > 250) {
            throw new Error('p24_url_status value must have from 0 to 250 characters.')
        }

        this.form.p24_url_status = value
    }

    setTimeLimit(value) {
        this.form.p24_time_limit = value
    }

    setWaitForResult(value) {
        this.form.p24_wait_for_result = value
    }

    setChannel(value) {
        this.form.p24_channel = value
    }

    setShipping(value) {
        this.form.p24_shipping = value
    }

    setTransferLabel(value) {
        if (value.length === 0 || value.length > 20) {
            throw new Error('p24_transfer_label value must have from 20 characters.')
        }

        this.form.p24_transfer_label = value
    }

    setOrderId(value) {
        this.form.p24_order_id = value
    }

    // Custom methods
    addProduct(name, description, quantity, price, number = null) {
        this.products.push({
            name: name,
            description: description,
            quantity: quantity,
            price: price,
            number: number
        })
    }

    addProducts(products) {
        this.products = this.products.concat(products)
    }

    loadProductsToForm() {
        for (let i = 0; i < this.products.length; i++) {
            const product = this.products[i]
            const id = i + 1

            this.form["p24_name_" + id] = product.name
            this.form["p24_quantity_" + id] = product.quantity
            this.form["p24_price_" + id] = product.price

            if (product.description !== null) {
                this.form["p24_description_" + id] = product.description
            }

            if (product.number !== null) {
                this.form["p24_number_" + id] = product.number
            }
        }
    }

    getCrc() {
        const data = this.form.p24_session_id + '|' + this.form.p24_pos_id + '|' + this.form.p24_amount + '|' + this.form.p24_currency + '|' + this.salt

        return crypto.createHash('md5').update(data).digest("hex");
    }

    // Main methods
    register() {
        return new Promise(async (resolve, reject) => {
            for (const field of this.REQUIRED_FIELDS_REGISTER) {
                if (this.form[field] === undefined) {
                    return reject(new Error(field + ' field is missing.'))
                }
            }

            this.form.p24_sign = this.getCrc()
            this.loadProductsToForm()

            try {
                const rawResponse = await request.post(this.host + "trnRegister", { form: this.form })

                if (rawResponse) {
                    const res = queryString.parse(rawResponse)

                    if (res.token) {
                        return resolve(res.token)
                    } else {
                        throw new Error(res.errorMessage)
                    }
                } else {
                    throw new Error('Error happened while registering payment, please try again.')
                }
            } catch (e) {
                return reject(e)
            }
        })
    }

    getPayByLinkUrl(token) {
        return this.host + 'trnRequest/' + token
    }

    verify() {
        return new Promise(async (resolve, reject) => {
            for (const field of this.REQUIRED_FIELDS_VERIFY) {
                if (this.form[field] === undefined) {
                    return reject(new Error(field + ' field is missing.'))
                }
            }

            this.form.p24_sign = this.getCrc()

            try {
                const rawResponse = await request.post(this.host + "trnVerify", { form: this.form })

                if (rawResponse) {
                    const res = queryString.parse(rawResponse)

                    if (res.error === '0') {
                        return resolve()
                    } else {
                        throw new Error(res.errorMessage)
                    }
                } else {
                    throw new Error('Error happened while verifying payment, please try again.')
                }
            } catch (e) {
                return reject(e)
            }
        })
    }
}