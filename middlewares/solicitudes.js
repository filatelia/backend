const { buscarPaisPorNombre } = require("./paises");
const { buscarNombreTipoCatalogo } = require("./tipo_catalogo");
const { consultarDatosConCorreo } = require("./usuario");
const { buscarTema } = require("./temas");
const { buscarIdConAbreviación } = require("./tipo_estado_solicitiud");
const { crearCatalogo } = require("./catalogo");
const { enviarCorreos } = require("./enviar_correos");
const Solicitudes = require("../models/solicitudes/solicitudes.model");

const Solicitud = require("../models/solicitudes/solicitudes.model");

const crearPrimeraSolicitud = async (
  nombre_catalogo_solicitud,
  tipo_catalogo_solicitud,
  pais_catalogo_solicitud,
  tema_catalogo_solicitud,
  correo
) => {
  try {
    //Creamos Objeto para guardar
    var objNuevaSolicitud = new Solicitud();

    //Asociando nombre de catalogo interno
    objNuevaSolicitud.catalogo_nombre_interno = nombre_catalogo_solicitud;

    //Buscar datos del usuarioBD
    var usuarioBD = await consultarDatosConCorreo(correo);
    if (usuarioBD == null) {
      return res.json({
        ok: false,
        msg: "Usuario no válido.",
      });
    }
    //Asociando el id del cliente a la solcitud
    objNuevaSolicitud.usuario_id = usuarioBD._id;

    //Asociando tipo catalogo.
    objNuevaSolicitud.tipo_catalogo = tipo_catalogo_solicitud;

    var nameTipoCatalogo = await buscarNombreTipoCatalogo(
      tipo_catalogo_solicitud
    );
    var paisEnBD = {};
    var buscarTemaEnBD = {};
    console.log("===============")
    if (nameTipoCatalogo == "Temático") {
      //Coomo el tema ya fue creado, se puede asociar
      // buscarTemaEnBD = await buscarTema(tema_catalogo_solicitud);

      // console.log("Tema en bd", buscarTemaEnBD);
      console.log("===============1")

      //Asociando tema
      objNuevaSolicitud.tema = tema_catalogo_solicitud;
    }
    if (nameTipoCatalogo == "País") {
      paisEnBD = await buscarPaisPorNombre(pais_catalogo_solicitud);
      objNuevaSolicitud.pais = paisEnBD._id;
    }

    //Asociar ID de tipo estado solicitud
    var primeraSolicitud = await buscarIdConAbreviación("EACE1");
    console.log("Priemrasmso", primeraSolicitud);

    //ASociando tipo estado solicitud
    objNuevaSolicitud.tipoEstadoSolicitud_id = primeraSolicitud._id;
    var primera = await objNuevaSolicitud.save();

    //Creando catalogo
    console.log("Primera", primera);
    console.log("Antes de entrar a crear cataloho");
    await crearCatalogo(
      nombre_catalogo_solicitud,
      primera._id,
      paisEnBD._id,
      tipo_catalogo_solicitud,
      buscarTemaEnBD._id
    );

    await enviarCorreos(
      usuarioBD.email,
      usuarioBD.name,
      primeraSolicitud.descripcion
    );
    return primera;
  } catch (e) {
    console.log("Error al crear la solicitud. Catch solicitudes middlewears");
    return null;
  }
};
const crearSegundaSolicitud = async (id_solicitud) => {
  try {
    console.log("Entramos a segunda");
    var solicitudBD = await Solicitudes.findOne({ _id: id_solicitud });

    console.log(
      "Solicitud BD ->",
      solicitudBD.tipoEstadoSolicitud_id.abreviacion
    );

    if (solicitudBD.tipoEstadoSolicitud_id.abreviacion == "ACE1") {
      var generarSegundaSolicitud = await buscarIdConAbreviación("EACE2");

      solicitudBD.tipoEstadoSolicitud_id = generarSegundaSolicitud._id;
      console.log("Antes de guardar", solicitudBD);
      var segSol = await solicitudBD.save();

      return segSol;
    } else {
      console.log("No es del tipoa ceptado");
      return null;
    }
  } catch (e) {
    console.log("Error en catch segunda solicitud");
    return null;
  }
};

const crearSolicitudAdmin = async (
  nombre_catalogo_solicitud,
  tipo_catalogo_solicitud,
  pais_catalogo_solicitud,
  tema_catalogo_solicitud,
  correo
) => {
  try {
   
    //Creamos Objeto para guardar
    var objNuevaSolicitud = new Solicitud();

    //Asociando nombre de catalogo interno
    objNuevaSolicitud.catalogo_nombre_interno = nombre_catalogo_solicitud;

    //Buscar datos del usuarioBD
    var usuarioBD = await consultarDatosConCorreo(correo);
    if (usuarioBD == null) {
      return res.json({
        ok: false,
        msg: "Usuario no válido.",
      });
    }
    //Asociando el id del cliente a la solcitud
    objNuevaSolicitud.usuario_id = usuarioBD._id;

    //Asociando tipo catalogo.
    objNuevaSolicitud.tipo_catalogo = tipo_catalogo_solicitud;
    var nameTipoCatalogo = await buscarNombreTipoCatalogo(
      tipo_catalogo_solicitud
    );
    var paisEnBD = {};
    var buscarTemaEnBD = {};
    if (nameTipoCatalogo == "Temático") {
      //Coomo el tema ya fue creado, se puede asociar
      // buscarTemaEnBD = await buscarTema(tema_catalogo_solicitud);

      // console.log("Tema en bd", buscarTemaEnBD);

      // //Asociando tema
      objNuevaSolicitud.tema = tema_catalogo_solicitud;
    }
    if (nameTipoCatalogo == "País") {
      paisEnBD = await buscarPaisPorNombre(pais_catalogo_solicitud);
      objNuevaSolicitud.pais = paisEnBD._id;
    }

    //Asociar ID de tipo estado solicitud
    var primeraSolicitud = await buscarIdConAbreviación("ACE2");
    
    //ASociando tipo estado solicitud
    objNuevaSolicitud.tipoEstadoSolicitud_id = primeraSolicitud._id;
    var primera = await objNuevaSolicitud.save();

    //Creando catalogo
    console.log("Primera", primera);
    console.log("Antes de entrar a crear cataloho");
    await crearCatalogo(
      nombre_catalogo_solicitud,
      primera._id,
      paisEnBD._id,
      tipo_catalogo_solicitud,
      tema_catalogo_solicitud,
      true
    );

    await enviarCorreos(
      usuarioBD.email,
      usuarioBD.name,
      primeraSolicitud.descripcion
    );
    return primera;
  } catch (e) {
    console.log("Error desde catch solicitudes crear solicitud admin");
    return null;
  }
};

module.exports = {
  crearPrimeraSolicitud,
  crearSegundaSolicitud,
  crearSolicitudAdmin,
};
