const { response } = require("express");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");
const Solicitud = require("../../models/solicitudes/solicitudes.model");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const Usuario = require("../../models/usuario/usuario");
const Pais = require("../../models/catalogo/paises");
const Catalogo = require("../../models/catalogo/catalogo");
const {
  eliminarEstampillasConIdCatalogo,
} = require("../../middlewares/estampillas");
const { eliminarCatalogo } = require("../../middlewares/catalogo");
const { consultarDatosConCorreo } = require("../../middlewares/usuario");
const { buscarNombreTipoCatalogo } = require("../../middlewares/tipo_catalogo");
const { buscarTema } = require("../../middlewares/temas");
const { buscarPaisPorNombre } = require("../../middlewares/paises");
const {
  crearPrimeraSolicitud,
  crearSegundaSolicitud,
  crearSolicitudAdmin,
} = require("../../middlewares/solicitudes");
const { crearCatalogo } = require("../../middlewares/catalogo");

const {
  enviarCorreos,
  enviarCorreoAprobacion,
} = require("../../middlewares/index.middle");

const crearSolicitud = async (req, res) => {
  try {
    // Se captura el token
    const token = req.header("x-access-token");

    //Se reciben todos los datos del usuario al crear la solicitud
    const {
      id_solicitud,
      nombre_catalogo_solicitud,
      tipo_catalogo_solicitud,
      pais_catalogo_solicitud,
      tema_catalogo_solicitud,
    } = req.body;
    //Con el token se busca el correo.
    const correo = retornarDatosJWT(token);
    var usuarioBDA = await Usuario.findOne({ email: correo });
    if (usuarioBDA.roleuser == "admin") {
      var solicitudAdmin = await crearSolicitudAdmin(
        nombre_catalogo_solicitud,
        tipo_catalogo_solicitud,
        pais_catalogo_solicitud,
        tema_catalogo_solicitud,
        correo
      );

      if (solicitudAdmin != null) {
        return res.json({
          ok: true,
          msg: "Se ha creado correctamente la solicitud",
          solicitud: solicitudAdmin,
        });
      } else {
        return res.json({
          ok: false,
          msg: "Ha ocurrido un error al crear la solicitud",
        });
      }
    }

    if (!id_solicitud || id_solicitud == null) {
      var prime = await crearPrimeraSolicitud(
        nombre_catalogo_solicitud,
        tipo_catalogo_solicitud,
        pais_catalogo_solicitud,
        tema_catalogo_solicitud,
        correo
      );
      return res.json({
        ok: true,
        msg: "Solicitud creada correctamente",
        solicitud: prime,
      });
    } else {
      var segunda = await crearSegundaSolicitud(id_solicitud);
      if (segunda != null) {
        console.log("Salimos de sgunda");
        return res.json({
          ok: true,
          msg:
            "Solicitud para aprobación de segunda etapa creada correctamente",
          solicitud: segunda,
        });
      } else {
        return res.json({
          ok: false,
          msg: "No se ha podido crear la segunda solicitud",
        });
      }
    }
  } catch (e) {
    return res.json({
      ok: false,
      mensaje: "No se ha podido crear la solicitud",
      ubicado_error: "Controller -> tipo_solicitud.js -> catch",
      error: e,
    });
  }
};

const crearCatalogoAdmin = async (solicitudGuardada) => {
  try {
    const objCatalogo = new Catalogo();
    objCatalogo.estado = true;
    objCatalogo.name = solicitudGuardada.catalogo_nombre;
    objCatalogo.solicitud = solicitudGuardada._id;
    objCatalogo.pais = solicitudGuardada.pais._id;
    objCatalogo.valor_catalogo = solicitudGuardada.valor_catalogo;

    const catalogoGuardado = await objCatalogo.save();
    return catalogoGuardado;
  } catch (e) {
    console.log("error ->", e);
  }
};

const mostarSolicitudes = async (req, res = response) => {
  try {
    console.log("entramos");
    const token = req.header("x-access-token");
    const correo = retornarDatosJWT(token);

    //Buscando el usuario logueado.
    const usuarioBD = await Usuario.findOne({ email: correo }, { _id: 1 });

    const solicitudBD = await Solicitud.find({ usuario_id: usuarioBD._id });

    if (solicitudBD != null) {
      res.json({
        ok: true,
        solicitudes: solicitudBD,
      });
    } else {
      res.json({
        ok: true,
        solicitudes: "El usuario no tiene solicitudes",
      });
    }
  } catch (e) {
    res.json({
      ok: false,
      msg: "No se ha podido consultar las solicitudes",
    });
  }
};
const mostarSolicitudesTotales = async (req, res = response) => {
  const todasSolicitudes = await Solicitud.find();
  return res.json({
    ok: true,
    todas_solicitudes: todasSolicitudes,
  });
};
const aprobacion = async (req, res = response) => {
  const { id_solicitud, mensaje_rechazo } = req.body;
  var solicitudBDA = {};
  console.log("req.body", req.body);
  if (id_solicitud && id_solicitud != null) {
    solicitudBDA = await Solicitud.findById({ _id: id_solicitud });
    if (solicitudBDA && solicitudBDA == null) {
      return res.json({
        ok: false,
        mensaje: "No existen solicitudes para el usuario consultado",
      });
    }
  }
  console.log("Solicitud encontrada en bd", solicitudBDA);
  //Buscar ids de tipo solicitud
  var id_estadoSolicitud = solicitudBDA.tipoEstadoSolicitud_id;
  const abreviacionConIdRecibido = await Tipo_solicitud.findOne({
    _id: id_estadoSolicitud,
  });

  //Modificando los estados rechazados
  if (mensaje_rechazo && mensaje_rechazo != null) {
    if (abreviacionConIdRecibido.abreviacion == "EACE1") {
      var { _id } = await Tipo_solicitud.findOne(
        { abreviacion: "RCE1" },
        { _id: 1 }
      );

      solicitudBDA.tipoEstadoSolicitud_id = _id;
      solicitudBDA.mensaje_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();
      var catalogoBD = await Catalogo.findOne({
        solicitud: solicitudActuaizada._id,
      });

      await eliminarCatalogo(catalogoBD._id);
      await eliminarEstampillasConIdCatalogo(catalogoBD._id);
      await enviarCorreoAprobacion(solicitudActuaizada);
      return res.json({
        ok: true,
        solicitudRechazada: solicitudActuaizada,
      });
    }
    if (abreviacionConIdRecibido.abreviacion == "EAE2") {
      var { _id } = await Tipo_solicitud.findOne(
        { abreviacion: "RCE2" },
        { _id: 1 }
      );
      solicitudBDA.tipoEstadoSolicitud_id = _id;
      solicitudBDA.mensaje_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();
      var catalogoBD = await Catalogo.findOne({
        solicitud: solicitudActuaizada._id,
      });
      await eliminarCatalogo(catalogoBD._id);
      await eliminarEstampillasConIdCatalogo(catalogoBD._id);
      await enviarCorreoAprobacion(solicitudActuaizada);

      return res.json({
        ok: true,
        solicitudRechazada: solicitudActuaizada,
      });
    }
    if (abreviacionConIdRecibido.abreviacion == "ACE2") {
      var { _id } = await Tipo_solicitud.findOne(
        { abreviacion: "RCE2" },
        { _id: 1 }
      );

      var catalogoEnBDActivo = await Catalogo.findOne({
        solicitud: id_solicitud,
      });

      (catalogoEnBDActivo.estado = false), await catalogoEnBDActivo.save();

      solicitudBDA.tipoEstadoSolicitud_id = _id;
      solicitudBDA.mensaje_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();
      await enviarCorreoAprobacion(solicitudActuaizada);
      var catalogoBD = await Catalogo.findOne({
        solicitud: solicitudActuaizada._id,
      });
      await eliminarCatalogo(catalogoBD._id);
      await eliminarEstampillasConIdCatalogo(catalogoBD._id);
      await enviarCorreoAprobacion(solicitudActuaizada);

      return res.json({
        ok: true,
        msg: "Has dado de baja correctamente el catalogo",
        catalogoAnulado: solicitudActuaizada,
      });
    }

    return res.json({
      ok: false,
      msg:
        "No puedes rechazar un catalogo de estado: " +
        abreviacionConIdRecibido.abreviacion,
      texto: abreviacionConIdRecibido.descripcion,
    });
  }

  //Modificando estados aceptados
  if (abreviacionConIdRecibido.abreviacion == "EACE1") {
    var { _id } = await Tipo_solicitud.findOne(
      { abreviacion: "ACE1" },
      { _id: 1 }
    );

    solicitudBDA.tipoEstadoSolicitud_id = _id;
    var solicitudActuaizada = await solicitudBDA.save();
    console.log("EACE1");
    await enviarCorreoAprobacion(solicitudActuaizada);

    return res.json({
      ok: true,
      solicitudAceptada: solicitudActuaizada,
    });
  }
  if (abreviacionConIdRecibido.abreviacion == "EACE2") {
    var { _id } = await Tipo_solicitud.findOne(
      { abreviacion: "ACE2" },
      { _id: 1 }
    );

    solicitudBDA.tipoEstadoSolicitud_id = _id;
    var solicitudActuaizada = await solicitudBDA.save();

    const catalogoBD = await Catalogo.findOne({ solicitud: id_solicitud });
    catalogoBD.estado = true;
    await catalogoBD.save();
    console.log("EACE2");

    await enviarCorreoAprobacion(solicitudActuaizada);

    return res.json({
      ok: true,
      catalogo_Publico: true,
      catalogo_publico: catalogoBD,
      solicitudAceptada: solicitudActuaizada,
    });
  }
  if (abreviacionConIdRecibido.abreviacion == "ACE1") {
    var { _id } = await Tipo_solicitud.findOne(
      { abreviacion: "EACE2" },
      { _id: 1 }
    );

    solicitudBDA.tipoEstadoSolicitud_id = _id;
    var solicitudActuaizada = await solicitudBDA.save();
    await enviarCorreoAprobacion(solicitudActuaizada);
    console.log("ACE1");

    return res.json({
      ok: true,
      solicitudAceptada: solicitudActuaizada,
    });
  }
};
module.exports = {
  crearSolicitud,
  mostarSolicitudes,
  mostarSolicitudesTotales,
  aprobacion,
};
