const { response } = require("express");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");




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
