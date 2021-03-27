
const { validarJWT, validarDeJWTRoleAdmin, retornarDatosJWT } = require('./validar-jwt');
const { crearImagen,eliminarImagenServidor } = require("./subir_imagen");
const { buscarTema, crearTema } = require("./buscar_crear_tema_cat");
const { enviarCorreos, enviarCorreoAprobacion } = require('./enviar_correos');
const { consultarUsuariosAdmin } = require('./usuario');
const { validarNuevaSolicitud } = require('./validaciones_crear_solicitud');
const { buscarPaisPorNombre, crearPaisesAutom } = require('./paises');



module.exports = {
    validarDeJWTRoleAdmin,
    validarJWT,
    retornarDatosJWT,
    eliminarImagenServidor, 
    crearImagen,
    buscarTema, 
    crearTema,
    enviarCorreos,
    consultarUsuariosAdmin,
    enviarCorreoAprobacion,
    validarNuevaSolicitud,
    buscarPaisPorNombre, 
    crearPaisesAutom
}