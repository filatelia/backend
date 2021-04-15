const { buscarPaisPorNombre } = require("./paises");
const { buscarNombreTipoCatalogo } = require("./tipo_catalogo");
const { consultarDatosConCorreo } = require("./usuario");
const { buscarTema, crearNuevoTema } = require("./temas");
const { buscarIdConAbreviación } = require("./tipo_estado_solicitiud");
const { crearCatalogo } = require("./catalogo");
const { enviarCorreos } = require("./enviar_correos");
const Solicitudes = require("../models/solicitudes/solicitudes.model");
const Paises = require('../models/catalogo/paises');

const Solicitud = require("../models/solicitudes/solicitudes.model");
const { isValidObjectId } = require("mongoose");

const crearPrimeraSolicitud = async (
  nombre_catalogo_solicitud,
  tipo_catalogo_solicitud,
  pais_catalogo_solicitud,
  tema_catalogo_solicitud,
  correo
) => {
  try {
    //Creamos Objeto para guardar
console.log("Creando primera solicitud");

var objNuevaSolicitud = new Solicitud();
console.log("1");
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
console.log("2");

    //Asociando el id del cliente a la solcitud
    objNuevaSolicitud.usuario_id = usuarioBD._id;
    console.log("3");

    //Asociando tipo catalogo.
    objNuevaSolicitud.tipo_catalogo = tipo_catalogo_solicitud;
    console.log("4");

    var nameTipoCatalogo = await buscarNombreTipoCatalogo(
      tipo_catalogo_solicitud
    );
console.log("5");

    var paisEnBD = {};
    var buscarTemaEnBD = {};
    console.log("===============")
    if (nameTipoCatalogo == "Temático") {
      //Coomo el tema ya fue creado, se puede asociar
       buscarTemaEnBD = await buscarTema(tema_catalogo_solicitud);

      // console.log("Tema en bd", buscarTemaEnBD);
      console.log("===============1")

      //Asociando tema
      objNuevaSolicitud.tema = buscarTemaEnBD._id;
    }
    if (nameTipoCatalogo == "País") {
      paisEnBD = await buscarPaisPorNombre(pais_catalogo_solicitud);
      objNuevaSolicitud.pais = paisEnBD._id;
    }

    //Asociar ID de tipo estado solicitud
    var primeraSolicitud = await buscarIdConAbreviación("EACE1");
    console.log("Primera solicitud", primeraSolicitud);

    //ASociando tipo estado solicitud
    objNuevaSolicitud.tipoEstadoSolicitud_id = primeraSolicitud._id;
    var primera = await objNuevaSolicitud.save();

    //Creando catalogo
    console.log("Primera", primera);
    console.log("Antes de entrar a crear cataloho");

    //validando que nombre de tema no exista.

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
    //console.log("Error --->",e);
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
      await enviarCorreos(
        solicitudBD.usuario_id.email,
        solicitudBD.usuario_id.name,
        primeraSolicitud.descripcion
      );

      return segSol;
    } else {
      console.log("No es del tipo ceptado");
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

const buscarSolicitudIdTema = async (id) =>{

  const solicitudBD = await Solicitud.findOne({ tema:id });
  return solicitudBD;

}
const validarDatosRecibidosMostrarDatosDuenioPais = async (req, res, next) =>{

  
  const { id_pais } = req.params;

  if (!id_pais || id_pais == null || id_pais == "" ){
    return res.json({
      ok: false,
      msg: "Debes enviar un id país"
    });

}

//Validando que sea un id pais valido
if(!isValidObjectId(id_pais))
{
  return res.json({
    ok: false,
    msg: "Debes enviar un id país válido"
  });

}

  //buscando existencia de pais en catalogo
  const existePais = await buscarDatosUsuarioPorIdPais(id_pais);
  try {
    //validando si no existe tema para retornar ok
    //si existe se retorna toda la información del cliente dueño
    if (existePais == null) {
      return res.json({
        ok: true,
        msg: true,
      });
    }
    else{
      next();
    }



  } catch (e) {
    return res.json({
      ok: false,
      msg: "ha ocurrido un error fatal, validarDatosRecibidosMostrarDatosDuenio",
      error: e
    });

  }


}

async function buscarDatosUsuarioPorIdPais(id_pais) {
  var datosBD = await Solicitudes.findOne( { pais:id_pais } ); 
  datosBD= datosBD.usuario_id;

  if(datosBD != null){
    var datosDuenio = new Object();
       datosDuenio.nombre_completo = datosBD.name+ " "+datosBD.apellidos ||"aa" ;
       datosDuenio.correo = datosBD.email;
       datosDuenio.telefono = datosBD.telefono;
       datosDuenio.apodo = datosBD.nickname;
    return datosDuenio;
  }
  return null;
    
}

const mostrarDatosDuenioPorPais = async (req, res) =>{

  const { id_pais } = req.params;

  const datosUsuarioBD = await buscarDatosUsuarioPorIdPais(id_pais);

return res.json({
  ok: true,
  msg: datosUsuarioBD
});

}

module.exports = {
  crearPrimeraSolicitud,
  crearSegundaSolicitud,
  crearSolicitudAdmin,
  buscarSolicitudIdTema,
  mostrarDatosDuenioPorPais,
  validarDatosRecibidosMostrarDatosDuenioPais
};
