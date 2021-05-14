const TipoEstadoSolicitud = require("../models/solicitudes/tipoEstadoSolicitud.model");

const buscarIdConAbreviación = async (abreviacion) => {
  try {
    var tipoEstadoSOlicitudBD = await TipoEstadoSolicitud.findOne({
      abreviacion,
    });

    if (tipoEstadoSOlicitudBD != null) {
      return tipoEstadoSOlicitudBD;
    }
    return null;
  } catch (e) {
    console.log("Error en catch de buscarIdConAbreviación");
    return null;
  }
};

module.exports = {
    buscarIdConAbreviación
};
