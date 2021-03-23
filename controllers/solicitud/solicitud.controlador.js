const { response } = require("express");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");
const Solicitud = require("../../models/solicitudes/solicitudes.model");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const Usuario = require("../../models/usuario/usuario");
const Pais = require("../../models/catalogo/paises");
const Catalogo = require("../../models/catalogo/catalogo");
const { enviarCorreos } = require("../../middlewares/index.middle");
const solicitudesModel = require("../../models/solicitudes/solicitudes.model");

const crearSolicitud = async (req, res = response) => {
  try {
    const token = req.header("x-access-token");

    //Se reciben todos los datos del usuario al crear la solicitud
    const solicitudRecibida = req.body;

    console.log("solicitud recibida: ", solicitudRecibida);

    if (
      solicitudRecibida.id_solicitud &&
      solicitudRecibida.id_solicitud != null
    ) {
      console.log("para el primer if");
      var id_estadoSolicitud = solicitudRecibida.id_solicitud;
      const abreviacionSolicitud = await Solicitud.findById(id_estadoSolicitud);
      const abreviacionConIdRecibido = await Tipo_solicitud.findOne({
        _id: abreviacionSolicitud.tipoEstadoSolicitud_id,
      });
      console.log("abreviacion: ", abreviacionConIdRecibido);

      if (abreviacionConIdRecibido.abreviacion == "EACE1") {
        var { _id } = await Tipo_solicitud.findOne(
          { abreviacion: "EACE2" },
          { _id: 1 }
        );

        abreviacionSolicitud.tipoEstadoSolicitud_id = _id;
        console.log("Abreviacion: ", abreviacionSolicitud);
        var solicitudActuaizada = await abreviacionSolicitud.save();

        return res.json({
          ok: true,
          solicitudEnviada: solicitudActuaizada,
        });
      } else {
        return res.json({
          ok: true,
          mensaje:
            "No puedes hacer ésta solicitud pues el estado de la solicitud es: " +
            abreviacionConIdRecibido.abreviacion,
          descripcion: abreviacionConIdRecibido.name,
        });
      }
    }

    if (!solicitudRecibida || solicitudRecibida == null) {
      return res.json({
        ok: false,
        msg: "No se han recibido datos.",
      });
    }
    if (
      !solicitudRecibida.catalogo_nombre ||
      solicitudRecibida.catalogo_nombre == null
    ) {
      solicitudRecibida.catalogo_nombre = "No asignado";
    }

    if (
      !solicitudRecibida.valor_catalogo ||
      solicitudRecibida.valor_catalogo == null
    ) {
      solicitudRecibida.valor_catalogo = "No asignado";
    }
    //Con el token se busca el correo.
    const correo = retornarDatosJWT(token);

    //Buscando el usuario logueado.
    const usuarioBD = await Usuario.findOne({ email: correo }, { _id: 1 });

    //Buscando el id de el tipo de solicitud para solicitud recien creada
    const solicitudBD = await Tipo_solicitud.findOne(
      { abreviacion: "EACE1" },
      { _id: 1 }
    );

    //Se prepara el pais recibido para buscarlo en la base de datos.
    const para_buscar = solicitudRecibida.pais
      .toLowerCase()
      .replace(/\s+/g, "");

    //Buscando id pais
    const pais = await Pais.findOne({ para_buscar }, { _id: 1 });

    //Se crea nuevo objeto de tipo solicitud
    const nuevaSolicitud = new Solicitud();

    //Asignando los datos recibidos al objeto nuevo para luego guardarlo.
    nuevaSolicitud.usuario_id = usuarioBD._id;
    nuevaSolicitud.tipoEstadoSolicitud_id = solicitudBD._id;
    nuevaSolicitud.pais = pais._id;
    nuevaSolicitud.catalogo_nombre = solicitudRecibida.catalogo_nombre;
    nuevaSolicitud.valor_catalogo = solicitudRecibida.valor_catalogo;

    //guardando la nueva solicitud
    const solicitudGuardada = await nuevaSolicitud.save();

    //Creando nuevo catálogo
    const nuevoCatalogo = await crearCatalogo(solicitudGuardada);

    console.log("Guardado -->", nuevoCatalogo);

    //Enviar correo de satisfaccion
    const estadoCorreo = await enviarCorreos();
    console.log("estado correo: ", estadoCorreo);

    return res.json({
      ok: true,
      msg: "Se ha creado la solicitud correctamente",
      solicitud_creada: solicitudGuardada,
    });
  } catch (e) {
    return res.json({
      ok: false,
      mensaje: "No se ha podido crear la solicitud",
      ubicado_error: "Controller -> tipo_solicitud.js -> catch",
      error: e,
    });
  }
};

const crearCatalogo = async (solicitudGuardada) => {
  try {
    const objCatalogo = new Catalogo();
    objCatalogo.name = solicitudGuardada.catalogo_nombre;
    objCatalogo.solicitud = solicitudGuardada._id;
    objCatalogo.pais = solicitudGuardada.pais._id;
    objCatalogo.valor_catalogo = solicitudGuardada.valor_catalogo;

    const catalogoGuardado = await objCatalogo.save();
    return catalogoGuardado;
  } catch (e) {}
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
  const abreviacionConIdRecibido = await Tipo_solicitud.findOne(
    { _id: id_estadoSolicitud },
    { abreviacion: 1 }
  );

  //Modificando los estados rechazados
  if (mensaje_rechazo && mensaje_rechazo != null) {
    if (abreviacionConIdRecibido.abreviacion == "EACE1") {
      var { _id } = await Tipo_solicitud.findOne(
        { abreviacion: "RCE1" },
        { _id: 1 }
      );

      solicitudBDA.tipoEstadoSolicitud_id = _id;
      solicitudBDA.observacion_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();
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
      solicitudBDA.observacion_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();

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

      var catalogoEnBDActivo = await Catalogo.findOne({ solicitud:id_solicitud });

      catalogoEnBDActivo.estado = false,
       await catalogoEnBDActivo.save();


      solicitudBDA.tipoEstadoSolicitud_id = _id;
      solicitudBDA.observacion_rechazo = mensaje_rechazo;
      var solicitudActuaizada = await solicitudBDA.save();

      return res.json({
        ok: true,
        msg: "Has dado de baja correctamente el catalogo",
        catalogoAnulado: solicitudActuaizada,
      });
    }
    return res.json({
      ok: false,
      msg: "No puedes rechazar un catalogo de estado: "+abreviacionConIdRecibido.abreviacion,
      texto: abreviacionConIdRecibido.descripcion
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
    return res.json({
      ok: true,
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
    return res.json({
      ok: true,
      solicitudAceptada: solicitudActuaizada,
    });
  }
  if (abreviacionConIdRecibido.abreviacion == "ACE2") {
    const catalogoBD = await Catalogo.findOne({ solicitud: id_solicitud });
    catalogoBD.estado = true;

    var cambios = await catalogoBD.save();

    return res.json({
      ok: true,
      solicitudAceptada: cambios,
    });
  }
};
module.exports = {
  crearSolicitud,
  mostarSolicitudes,
  mostarSolicitudesTotales,
  aprobacion,
};
