const TipoEstadoReporte = require("../models/moderacion/tipo-estado-reporte.model");
const Reportes = require("../models/moderacion/reportes.modelo");
async function consultarTipoEstadoReporteConAbreviacion(abreviacion) {
  try {
    const datosBD = await TipoEstadoReporte.findOne({ abreviacion });
    return datosBD;
  } catch (error) {
    console.log(
      "error en catch | consultarTipoEstadoReporteConAbreviacion(abreviacion)",
      error
    );
    return false;
  }
}

async function consultarReporteConIdReporte(idReporte) {
  try {
    return await Reportes.findById(idReporte);
  } catch (error) {
    console.log(
      "Error al buscar reporte | catch consultarReporteConIdReporte",
      error
    );
    return false;
  }
}

module.exports = {
  consultarTipoEstadoReporteConAbreviacion,
  consultarReporteConIdReporte,
};
