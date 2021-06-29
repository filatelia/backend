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

const  generarTokenPaypal = async(client, secret) => {
  console.log("Generando Token");

  let username = client;
  let password = secret;


    try {
      
      const  peticion = await axios(
        {
          url: process.env.PAYPAL_API+"/v1/oauth2/token",
          method: "POST",
          headers:{
            "Content-Type": "application/x-www-form-urlencoded",
          },
          auth: {
            username,
            password
          },
          params: {
            grant_type: "client_credentials"
          }

        });

        return peticion.data.access_token;

    } catch (error) {
      
    }



}

const crearPagoPaypal = async(client, secret, total) =>{
  try {
   
      const url = `${process.env.PAYPAL_API}/v2/checkout/orders`;
      //determinamos la url
      const data = await generarTokenPaypal(client, secret);

      //generamos el token
      const access_token = await data;
      //leemos el access_token
  
      console.log("access", access_token);
      console.log("total", total);
      console.log("total string", total.toString());
      const settings = {
        method: "POST",
        //hacemos un POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`
        },
        //en el header mandamos el TOKEN
        data: {
          //enviamos la información requerida por PAYPAL
          intent: "CAPTURE",
          purchase_units: [
            //este es un array de artículos, con su respectivo precio
            {
              amount: {
                currency_code: "USD",
                //la moneda a utilizar
                value: ''+total
                //el precio, que deber ser un string
              }
            }
          ],
          application_context: {
            //información adicional sobre cómo queremos que sea el checkout
            brand_name: "Filatelia Peruana",
            //el nombre de la marca que va a aparecer cuando el usuario intente comprar
            locale: "es-ES",
            //el idioma que va a intentar a utilizar en el checkout
            user_action: "PAY_NOW",
            //la acción que va a realizar el usuario, generalmente siempre queremos PAY_NOW
            landing_page: "NO_PREFERENCE",
            //esto es por si lo queremos enviar a un flujo puntual de paypal, por ejemplo al login, a pagar, o a otro lado.
            payment_method: {
              //esta es la información que limita los métodos de pago
              payer_selected: "PAYPAL",
              payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
            },
            shipping_preference: "NO_SHIPPING",
            //aclaramos que no vamos a relizar un envio, ya que es un servicio en este ejemplo
            return_url: process.env.API+"api/pagos/execute-payment"
            //tenemos la opción de ingresar la url a la cual será redirigido el usuario una vez que la transacción sea completada
          }
        },
        url
        //el endpoint de la api de Payapal
      };
  
      return axios(settings).then(async (response) => {

        // suelen venir muchos links en la respuesta, es por eso que tenemos que hacer un find para encontrar el que necesitamos
        if (response && response.data && response.data.links) {
          const link = response.data.links.find((link) => {
            return link.rel == "approve";
            //el que necesitamos viene con un rel: "approve"
          });
          //retornamos el link que tiene rel: "approve"
          return { link: link.href,
          idVentaPaypal: response.data.id
          };
        }
        return;
      });
    
  } catch (error) {
    
  }
}
module.exports = {
  crearPago,
  executePayment,
  configurarPaypal,
  consultarPaypal,
  todasMonedasPaypalMD,
  consultarConvertirMonedaTiempoReal,
  generarTokenPaypal,
  crearPagoPaypal
};
