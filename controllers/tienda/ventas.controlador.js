const { response } = require("express");
const { crearDatosEnvio, mostrarDatosEnvioIdUsuario } = require("../../middlewares/ventas");
const { validarCamposGeneral, isValidObjectIdGeneral } = require('../../middlewares/validar-campos');

const crearVenta = async (req, res = response) => {};

const crearDatosEnvioCtr = async (req, res = response) => {
  console.log("Creando datos de envío");

  const { 
      usuario,
      telefono,
      direccion_completa,
      otras_indicaciones
    
    } = req.body;

  try {

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(usuario);
    arrayCamposValidar.push(telefono);
    arrayCamposValidar.push(direccion_completa);
    arrayCamposValidar.push(otras_indicaciones);

    var validarCamposG = validarCamposGeneral(4, arrayCamposValidar);
    if(!validarCamposG) return res.json({ok:false, msg: "Debes enviar los datos necesarios."});

    arrayIdsValidar.push(usuario);
    var validarIds= isValidObjectIdGeneral(1, arrayIdsValidar);
    if(!validarIds) return res.json({ok:false, msg: "Debes enviar id usuario válido."});

    var datosEnvioCreados = await crearDatosEnvio(req.body);
    return res.json(datosEnvioCreados);

    

  } catch (error) {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    console.log("Error en catch crearDatosEnvioCtr " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch crearDatosEnvioCtr";
    
    return res.json(objetoRespuesta);
  }
};

const mostrarDatosEnvioCtr = async (req, res = response) =>{
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idDatosEnvio } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idDatosEnvio);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    var productosBD = await mostrarDatosEnvioIdUsuario(idDatosEnvio);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch mostrarDatosEnvioCtr", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch mostrarDatosEnvioCtr";
    return res.json(objetoRespuesta);
  }
}
module.exports = {
  crearVenta,
  crearDatosEnvioCtr,
  mostrarDatosEnvioCtr
};
