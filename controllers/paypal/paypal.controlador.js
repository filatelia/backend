const request = require("request");
const funcionesPaypal = require("../../funciones/paypal");
const CuentaPaypal = require("../../models/pagos/cuentaPaypal");
const { retornarIdClienteConJWT } = require("../../funciones/validar-jwt");

function autenticarPaypal(params) {}

const crearPago = async (req, res) => {
  var { total, nombreProducto } = req.body;

  if (!nombreProducto) {
    res.json({
      ok: false,
      msg: "Debes enviar el nombre del producto.",
    });
  }
  if (!total) {
    res.json({
      ok: false,
      msg: "Debes enviar el valor total del producto.",
    });
  }

  var totalConver = await funcionesPaypal.consultarConvertirMonedaTiempoReal(
    total
  );
  total = totalConver.usd.toFixed(2);

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD", //https://developer.paypal.com/docs/api/reference/currency-codes/
          value: total,
        },
      },
    ],
    application_context: {
      brand_name: `Filatelia Peruana - ${nombreProducto}`,
      landing_page: "NO_PREFERENCE", // Default, para mas informacion https://developer.paypal.com/docs/api/orders/v2/#definition-order_application_context
      user_action: "PAY_NOW", // Accion para que en paypal muestre el monto del pago
      return_url: `http://localhost:3000/api/pagos/execute-payment`, // Url despues de realizar el pago
      cancel_url: `http://localhost:3000/cancel-payment`, // Url despues de realizar el pago
    },
  };

  const token = req.header("x-access-token");

  var idUsuario = retornarIdClienteConJWT(token);

  var cuentaBD = await CuentaPaypal.findOne({ usuario: idUsuario });

  var auth = {
    user: cuentaBD.client,
    pass: cuentaBD.secret,
  };

  request.post(
    `${process.env.PAYPAL_API}/v2/checkout/orders`,
    {
      auth,
      body,
      json: true,
    },
    (err, response) => {
      var data = null;
      var ok = false;

      for (const iterator of response.body.links) {
        if (iterator.rel == "approve") {
          ok = true;
          data = iterator.href;
        }
      }
      console.log("estatus compra -> ", ok);
      res.json({
        ok,
        data,
      });
    }
  );
};

const executePayment = (req, res) => {
  const token = req.query.token;

  console.log("..");
  console.log("..");
  console.log("token: ", token);
  request.post(
    `${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {
      auth,
      body: {},
      json: true,
    },
    (err, response) => {
      res.json({ data: response });
    }
  );
};

const configurarPaypal = async (req, res) => {
  try {
    var { client, secret } = req.body;

    if (!client) {
      return res.json({
        ok: false,
        msg: "Debes enviar el cliente de Paypal.",
      });
    }
    if (!secret) {
      return res.json({
        ok: false,
        msg: "Debes enviar el secreto de Paypal.",
      });
    }
    const token = req.header("x-access-token");

    var idUsuario = retornarIdClienteConJWT(token);
    req.body.usuario = idUsuario;

    var cuentaBD = await CuentaPaypal.find({ usuario: idUsuario });
    console.log("usuaro bd -->", cuentaBD.length);

    var msg = "";
    if (cuentaBD.length > 0) {
      await CuentaPaypal.findOneAndUpdate({ usuario: idUsuario }, req.body);
      msg = "Cuenta editada correctamente";
    } else {
      msg = "Cuenta configurada correctamente";
      var nuevaCuentaPaypal = new CuentaPaypal(req.body);
      await nuevaCuentaPaypal.save();
    }

    res.json({
      ok: true,
      msg,
    });
  } catch (error) {
    console.log("error ---> " + error);
    res.json({
      ok: false,
      error,
    });
  }
};

const consultarPaypal = async (req, res) => {
  try {
    const token = req.header("x-access-token");

    var idUsuario = retornarIdClienteConJWT(token);

    var objPaypal = await CuentaPaypal.findById(idUsuario);

    res.json({
      ok: true,
      data: objPaypal,
    });
  } catch (error) {
    res.json({
      ok: false,
      error,
    });
  }
};

module.exports = {
  crearPago,
  executePayment,
  configurarPaypal,
  consultarPaypal,
};
