const { response } = require("express");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");
const Solicitud = require("../../models/solicitudes/solicitudes.model");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const Usuario = require("../../models/usuario/usuario");
const Pais = require("../../models/catalogo/paises");
const Catalogo = require("../../models/catalogo/catalogo");
const { enviarCorreos } = require("../../middlewares/index.middle");

const crearSolicitud = async (req, res = response) => {
  try {
    const token = req.header("x-access-token");

    //Se reciben todos los datos del usuario al crear la solicitud
    const solicitudRecibida = req.body;
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

} catch (e) {

}  


};

const mostarSolicitudes = async(req, res = response) =>{
 
  try {
    console.log("entramos");
    const token = req.header("x-access-token");
    const correo = retornarDatosJWT(token);
  
    //Buscando el usuario logueado.
    const usuarioBD = await Usuario.findOne({ email: correo }, { _id: 1 });
    
    const solicitudBD = await Solicitud.find( { usuario_id:usuarioBD._id });
   
    if (solicitudBD != null) {
   
      res.json({
        ok:true,
        solicitudes: solicitudBD
      });
       
    } else {
  
      res.json({
        ok:true,
        solicitudes: "El usuario no tiene solicitudes"
      });
        
    }
   
  } catch (e) {
    res.json({
      ok: false,
      msg: "No se ha podido consultar las solicitudes"
    });
  
  }
  
  
}
const mostarSolicitudesTotales = async (req, res = response) =>{

  const todasSolicitudes = await Solicitud.find();
 return res.json(
    {
      ok: true,
      todas_solicitudes: todasSolicitudes
    }
    ); 

}
const aprobacion = async (req, res = response) =>{
  const { id_solicitud, mensaje_rechazo } = req.body;
  if (id_solicitud && id_solicitud != null) {

    const solicitudBD = await Solicitud.findById(id_solicitud);
    if(solicitudBD != null){}
    else{} 
    
  } else {
    
  }

  if(mensaje_rechazo && mensaje_rechazo != null){

  }



  console.log("Entramos");
}
module.exports = {
  crearSolicitud,
  mostarSolicitudes,
  mostarSolicitudesTotales,
  aprobacion


};
