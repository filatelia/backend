
const auth = { user: process.env.CLIENTE_PAYPAL, 
    pass:process.env.SECRET_PAYPAL,
    api: process.env.PAYPAL_API
 }

function autenticarPaypal(params) {
    
}

module.exports ={
    auth
}