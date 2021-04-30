const { default: axios } = require("axios");
const Monedas = require("../models/tienda/monedas");

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

    var monedaEnUsd  = monedaEnUsd = (valor * datosConversion.data.rates['PEN']);
  

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
module.exports = {
  todasMonedasPaypalMD,
  consultarConvertirMonedaTiempoReal,
};
