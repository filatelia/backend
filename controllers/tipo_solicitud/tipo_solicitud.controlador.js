const { response } = require("express");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");
const Solicitud = require("../../models/solicitudes/solicitudes.model");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const Usuario = require("../../models/usuario/usuario");
const Pais = require("../../models/catalogo/paises");
const Catalogo = require('../../models/catalogo/catalogo');

const creartipo = async (req, res = response) => {
  const objRecibido = req.body;

  const nuevoTSolicitud = new Tipo_solicitud(objRecibido);

  const nuevaSolicitud = await nuevoTSolicitud.save();

  console.log("Nueva solicitud", nuevaSolicitud);
  res.json({
    respuesta: "Entramos",
  });
};


module.exports = {
  creartipo,

};
