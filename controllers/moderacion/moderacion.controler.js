const { response } = require("express");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const { consultarReporteConIdReporte, consultarTodosTiposEstadoReporte } = require("../../middlewares/reportes");

const {
  consultarDatosConCorreo,
  consultarDatosConApodo,
  consultarDatosConId,
} = require("../../middlewares/usuario");
const {
  consultarTipoEstadoReporteConAbreviacion,
  consultarTipoEstadoReporteConId,
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
    var todosReportes = await Reportes.find();
    todosReportes.map(data =>{
      data.usuario_reportado.password = null;
      data.usuario_reportado.pais_usuario = null;
      data.usuario_reportado.tipo_catalogo = null;
      data.usuario_reportado.paises_coleccionados = null;

      data.usuario_reportante.password = null;
      data.usuario_reportante.pais_usuario = null;
      data.usuario_reportante.tipo_catalogo = null;
      data.usuario_reportante.paises_coleccionados = null;
      
    });
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

const mostrarTodosReportesSinAnalizar = async (req, res) => {
  try {
    
    const tipoEstadoReporteSinAnalizar = await consultarTipoEstadoReporteConAbreviacion("NP.CEA"); 
    var todosReportes = await Reportes.find({ tipo_estado_reporte: tipoEstadoReporteSinAnalizar._id});
    todosReportes.map(data =>{
      data.usuario_reportado.password = null;
      data.usuario_reportado.pais_usuario = null;
      data.usuario_reportado.tipo_catalogo = null;
      data.usuario_reportado.paises_coleccionados = null;

      data.usuario_reportante.password = null;
      data.usuario_reportante.pais_usuario = null;
      data.usuario_reportante.tipo_catalogo = null;
      data.usuario_reportante.paises_coleccionados = null;
      
    });
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

    const tipoEstadoReporteRecibido = await consultarTipoEstadoReporteConId(
      id_tipo_estado_reporte
    );

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

    //Asociando nuevo estado de reporte
    reporteBD.tipo_estado_reporte = tipoEstadoReporteRecibido._id;
    var reporteAtualizado = await reporteBD.save();
    console.log("reporteAtualizado -> ", reporteAtualizado);

    //-------------------------------------//
    //tomando medidas de acuerdo a lo seleciconado por el admin
    //Dando de baja al usuario
    var usuarioBD = await consultarDatosConId(reporteBD.usuario_reportado._id);
    if (tipoEstadoReporteRecibido.abreviacion === "P.DB") {
      usuarioBD.estado = false;
      var usuarioactualizado = await usuarioBD.save();
      if (usuarioactualizado == null) {
        return res.json({
          ok: false,
          msg: "Error al dar de baja.",
        });
      }
    }
    if (tipoEstadoReporteRecibido.abreviacion === "P.IA") {
      var reputacion = usuarioBD.reputacion;
      usuarioBD.reputacion = reputacion - 20;
      var usuarioactualizado = await usuarioBD.save();
    }

    await enviarCorreosReporteAnalisis(reporteAtualizado);
    return res.json({
      ok: true,
      msg: "Reporte actualizado correctamente",
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error al actualizar reporte",
      error: error,
    });
  }

};

const todosTipoEstadoReporte = async (req, res= response)=>{

  const tiposEstadoReporte= await consultarTodosTiposEstadoReporte();
  return res.json({
    ok: true,
    msg: tiposEstadoReporte
  }); 

}

const ignorarReporte = (module.exports = {
  crearReporte,
  mostrarTodosReportes,
  cambiarEstadoReporte,
  mostrarTodosReportesSinAnalizar,
  todosTipoEstadoReporte
});
