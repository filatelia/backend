const { response } = require("express");
const { request } = require("http");
const path = require("path");
const Paypal = require("../../paypal/config")

function crearPago(req, res = response) {
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: "100",
        },
      },
    ],
    application_context: {
        brand_name: "Filatelia Peruana",
        landing_page: "NO_PREFERENCE",
        user_action: "Pagar_Ahora",
        return_url: path.join(__dirname, "../../api/payapal"),
        cancel_url: path.join(__dirname, "../../api/payapal/compra-cancelada"),
    }
  };

  request.post(`${Paypal.auth.api}/v2/checkout/orders`);
}

module.exports = {
  crearPago,
};
