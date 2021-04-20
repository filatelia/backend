const { response } = require("express");
const { validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const {
  consultarReporteConIdReporte,
  consultarTipoEstadoReporteConId,
} = require("./reportes");

const validarCampos = (req, res = response, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errores.mapped(),
    });
  }

  next();
};
const validarDatosRecibidosCrearEstampilla = async (req, res, next) => {
  const {
    id_solicitud,
    descripcion,
    codigo,
    tipo,
    pais,
    tema,
    anio,
    grupo,
    nro_Estampillas,
    descripcion_de_la_serie,
    valor_Facial,
    numero_de_catalogo,
    valor_del_Catalogo,
    varientes_errores,
  } = req.body;

  next();
};
const validarDatoscambiarEstadoReporte = async (req, res = response, next) => {
  const { idReporte, id_tipo_estado_reporte } = req.body;

  if (
    !idReporte ||
    idReporte == null ||
    idReporte == "" ||
    !id_tipo_estado_reporte ||
    id_tipo_estado_reporte == null ||
    id_tipo_estado_reporte == ""
  ) {
    return res.json({
      ok: false,
      msg: "Debes enviar los datos obligatorios.",
    });
  }

  if (!isValidObjectId(idReporte) || !isValidObjectId(id_tipo_estado_reporte)) {
    return res.json({
      ok: false,
      msg: "Los datos enviados no son correctos",
    });
  }
  var reporteBD = await consultarReporteConIdReporte(idReporte);
  if (!reporteBD._id) {
    return res.json({
      ok: false,
      msg: "No existe el reporte",
    });
  }

  if (reporteBD.tipo_estado_reporte.abreviacion != "NP.CEA") {
    return res.json({
      ok: false,
      msg: "No puedes modificar un reporte que ya fue analizado.",
    });
  }

  var tipoEstadoBD = await consultarTipoEstadoReporteConId(
    id_tipo_estado_reporte
  );
  if (!tipoEstadoBD._id) {
    return res.json({
      ok: false,
      msg: "No existe el tipo estado reporte",
    });
  }
  next();
};
module.exports = {
  validarCampos,
  validarDatosRecibidosCrearEstampilla,
  validarDatoscambiarEstadoReporte,
};
