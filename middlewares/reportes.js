const TipoEstadoReporte = require('../models/moderacion/tipo-estado-reporte.model');

async function consultarTipoEstadoReporteConAbreviacion(abreviacion) {
    try {
     
    const datosBD = await TipoEstadoReporte.findOne({ abreviacion });
    return datosBD;

    } catch (error) {
    
        console.log("error en catch | consultarTipoEstadoReporteConAbreviacion(abreviacion)", error);
        return false;
    }
}


module.exports = {
consultarTipoEstadoReporteConAbreviacion,
}