const request = require('request');
const auth = { user: process.env.CLIENTE_PAYPAL, 
    pass:process.env.SECRET_PAYPAL
 }

function autenticarPaypal(params) {
    
}

const crearPago = (req, res) => {

    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD', //https://developer.paypal.com/docs/api/reference/currency-codes/
                value: '115'
            }
        }],
        application_context: {
            brand_name: `Filatelia Peruana`,
            landing_page: 'NO_PREFERENCE', // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
            user_action: 'PAY_NOW', // Accion para que en paypal muestre el monto del pago
            return_url: `http://localhost:3000/api/pagos/execute-payment`, // Url despues de realizar el pago
            cancel_url: `http://localhost:3000/cancel-payment` // Url despues de realizar el pago
        }
    }
    request.post(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body,
        json: true
    }, (err, response) => {

        var data= null;
        var ok= false;

        var array = response.body

        for (const iterator of response.body.links) {

            if (iterator.rel == "approve" ) {
                ok=true
                data = iterator.href
            }
            
        }
        console.log("estatus compra -> ", ok);
        res.json({ 
            ok,
             data })
    })
}

const executePayment = (req, res) => {
    const token = req.query.token;

console.log("..");
console.log("..");
console.log("token: ",  token);
    request.post(`${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        res.json({ data: response })
    })
}

module.exports ={
    crearPago,
    executePayment
}