const { default: axios } = require("axios");
const Monedas = require("../models/tienda/monedas");
const request = require("request");
const CuentaPaypal = require("../models/pagos/cuentaPaypal");
const { retornarIdClienteConJWT } = require("../funciones/validar-jwt");

async function todasMonedasPaypalMD() {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      consulta: null,
      tipo_error: null,
    });

    var todasMonedas = await Monedas.find();
    if (todasMonedas.length > 0) {
      objetoRespuesta.msg = "Se ha realizado la consulta corrrectamente";
      objetoRespuesta.consulta = todasMonedas;

      return objetoRespuesta;
    } else {
      objetoRespuesta.msg = "No existen monedas en la bd";

      return objetoRespuesta;
    }
    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch todasMonedasPaypalMD de middlewears" + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch de todasMonedasPaypalMD";

    return objetoRespuesta;
  }
}
async function consultarConvertirMonedaTiempoReal(valor) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    ///Cuando todo sale ok/////
    const datosConversion = await axios({
      method: "GET",
      url:
        "https://openexchangerates.org/api/latest.json?app_id=2753f0ce42a641188e6b96a31977228e",
    });
    var objetoRespuesta = new Object({
      ok: false,
      msg: null,
      usd: null,
      tipo_error: null,
    });

    //////ERROR EN CONSULTA API /////
    if (!datosConversion) {
      objetoRespuesta.msg =
        "No se ha podido consultar el valor actual del dolar.";
      objetoRespuesta.tipo_error = "Error api datosConversion";
      return objetoRespuesta;
    }
    
    //////CONSULTA OK, -> CONVERSIÓN /////
    

    

    var  monedaEnUsd = ( valor / datosConversion.data.rates['PEN'] );

    var aSumar = monedaEnUsd * 0.024682596023; 

    console.log(" A sumar ", aSumar);

  
    var to = monedaEnUsd + aSumar;

    monedaEnUsd = to;



  

    console.log("Monead en usd", monedaEnUsd);
    //////ERROR EN CONVERSIÓN /////

    if (!monedaEnUsd) {
      objetoRespuesta.msg = "Error al convertir el valor";
      objetoRespuesta.tipo_error = "Error de conversión.";
      return objetoRespuesta;
    }

    //////CONVERSIÓN EFECTUADA CORRECTAMENTE ///////
    objetoRespuesta.ok = true;
    objetoRespuesta.usd = monedaEnUsd;

    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch consultarConvertirMonedaTiempoReal" + error);
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch ";

    return objetoRespuesta;
  }
}

async function crearPago(total, nombreProducto, idUsuario) {



  var totalConver = await consultarConvertirMonedaTiempoReal(
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
      return_url: `${process.env.API}api/pagos/execute-payment`, // Url despues de realizar el pago
      cancel_url: `${process.env.API}api/cancel-payment`, // Url despues de realizar el pago
    },
  };

 



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
      var obj = {
        ok:ok,
        data:data
      }
      return obj;
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
  todasMonedasPaypalMD,
  consultarConvertirMonedaTiempoReal,
};
