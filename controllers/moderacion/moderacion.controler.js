const { response } = require("express");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const { consultarReporteConIdReporte } = require("../../middlewares/reportes");

const {
  consultarDatosConCorreo,
  consultarDatosConApodo,
  consultarDatosConId,
} = require("../../middlewares/usuario");
const {
  consultarTipoEstadoReporteConAbreviacion,
} = require("../../middlewares/reportes");
const Reportes = require("../../models/moderacion/reportes.modelo");
const {
  enviarCorreosReporte,
  enviarCorreosReporteAnalisis,
} = require("../../middlewares/enviar_correos");


const crearReporte = async (req, res = response) => {
  const { apodo_us_reportado, razones_reporte } = req.body;

  //-------------------------------------//
  //Obteniendo datos del usuario reportado

  //Consultando datos usario reportado con apodo
  const usuarioReportadoBD = await consultarDatosConApodo(apodo_us_reportado);
  if (usuarioReportadoBD == null) {
    return res.json({
      ok: false,
      msg:
        "Error en consultar los datos del cliente reportado | usuarioReportadoBD",
    });
  }

  //-------------------------------------//
  //Obteniendo datos del usuario reportante

  // Leer el Token
  const token = req.header("x-access-token");

  //consultando el email reportante
  const email = retornarDatosJWT(token);

  //Consultando usuario reportante BD con email
  const usuarioReportanteBD = await consultarDatosConCorreo(email);
  if (usuarioReportanteBD == null) {
    return res.json({
      ok: false,
      msg:
        "Error en consultar los datos del cliente reportante | usuarioReportanteBD",
    });
  }

  //-------------------------------------//
  //Consultando tipo estado solicitud

  /**
   * Como apenas se está  creando la solicitud, se  busca la abreviacion NP.CEA
   *
   * Significado NP.CEA -> Reporte creado correctamente, en espera del Análisis
   * del Administrador, para evaluar si el Usuario cometió una falta a las
   * normas de convivencia de la comunidad Filatelia.Por el momento,
   * éste estado de reporte no disminuye la reputación, ni cancelará la cuenta
   * del Usuario Reportado
   */
  const tipoEstadoReporteBD = await consultarTipoEstadoReporteConAbreviacion(
    "NP.CEA"
  );
  if (tipoEstadoReporteBD == false) {
    return res.json({
      ok: false,
      msg:
        "No se  puedo crear reporte, error en consultar el estado del reporte.",
    });
  }
  if (tipoEstadoReporteBD == null) {
    return res.json({
      ok: false,
      msg: "No se  puedo crear reporte, no se encontró estado del reporte.",
    });
  }

  //-------------------------------------//
  //Creando reporte.

  //Asociando valores para guardar

  const objReportes = new Reportes({
    usuario_reportado: usuarioReportadoBD._id,
    usuario_reportante: usuarioReportanteBD._id,
    tipo_estado_reporte: tipoEstadoReporteBD._id,
    descripcion_reporte_cliente: razones_reporte,
  });

  var reporteGuardado = await objReportes.save();

  if (reporteGuardado._id) {
    await enviarCorreosReporte(reporteGuardado);

    return res.json({
      ok: true,
      msg: reporteGuardado,
    });
  } else {
    return res.json({
      ok: false,
      msg: "Error al crear el reporte",
    });
  }
};
const mostrarTodosReportes = async (req, res) => {
  try {
    const todosReportes = await Reportes.find();
    return res.json({
      ok: true,
      msg: todosReportes,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error fatal al consultar los reportes | mostrarTodosReportes .",
      error: error,
    });
  }
};
const cambiarEstadoReporte = async (req, res) => {
  try {
    const { idReporte, id_tipo_estado_reporte } = req.body;





    //---------------------------------/
    //Actualizar Tipo Estado de Reporte//

    //Buscar reporte con id reporte
    var reporteBD = await consultarReporteConIdReporte(idReporte);
    

    if (reporteBD == false) {
      return res.json({
        ok: false,
        msg: "Error al buscar reporte",
      });
    }
    if (reporteBD == null) {
      return res.json({
        ok: false,
        msg: "No se encontro reporte",
      });
    }

    /**
     * Consultar Tipo Estado Reporte
     * Tipo estado solicitud -> P.DB
     * Descripción ->
     * Reporte analizado, concluyendo que el Usuario incumple las
     * normas de convivencia de la comunidad Filatelia.
     */

    var tipoEstadoReporteBD = await consultarTipoEstadoReporteConAbreviacion(
      "P.DB"
    );
    if (tipoEstadoReporteBD == false) {
      return res.json({
        ok: false,
        msg:
          "No se  puedo crear reporte, error en consultar el estado del reporte.",
      });
    }
    if (tipoEstadoReporteBD == null) {
      return res.json({
        ok: false,
        msg: "No se  puedo crear reporte, no se encontró estado del reporte.",
      });
    }

    var reporteBD = await consultarReporteConIdReporte(idReporte);
    if (reporteBD == false) {
      return res.json({
        ok: false,
        msg:
          "No se  puedo crear reporte, error en consultar el estado del reporte.",
      });
    }
    if (reporteBD == null) {
      return res.json({
        ok: false,
        msg: "No se  puedo crear reporte, no se encontró estado del reporte.",
      });
    }

    //Asociando nuevo estado de reporte
    reporteBD.tipo_estado_reporte = tipoEstadoReporteBD._id;
     var reporteAtualizado= await reporteBD.save();
     console.log("reporteAtualizado -> ", reporteAtualizado);

    //Dando de baja al usuario
    var usuarioBD = await consultarDatosConId(reporteBD.usuario_reportado._id);
    usuarioBD.estado = false;
    var usuarioactualizado = await usuarioBD.save();
    if (usuarioactualizado == null) {
      return res.json({
        ok: false,
        msg: "Error al dar de baja.",
      });
    }
    console.log("usuarioactualizado ->", usuarioactualizado);
  await enviarCorreosReporteAnalisis(reporteBD);
   return res.json({
      ok: true,
      msg: "Usuario dado de baja correctamente.",
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error al dar de baja al usuario",
      error: error
    });
  }

  //buscar usuario en bd
};

const ignorarReporte = 
module.exports = {
  crearReporte,
  mostrarTodosReportes,
  cambiarEstadoReporte,
  
};
