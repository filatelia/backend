/**
 * ruta -> api/pruebas
 *
 */
const { Router } = require("express");

const {
  createImageEstampilla,
} = require("../../controllers/catalogo/uploads.controlador");
const {
  consultarMensajeConIdClienteIdMensaje,
  paPruebas,
} = require("../../funciones/reportes");

const {
  guardarImagenDirectorioBase64,
} = require("../../controllers/pruebas/excel");
const {
  googlePruebas,
} = require("../../controllers/google/google.controlador");

const router = Router();

router.post("/google/", googlePruebas);
router.get("/guardar-base64/", guardarImagenDirectorioBase64);

//router.post( '/agregar/', agregarSerieMancolista );
//router.post( '/', verMancolistCatId );

module.exports = router;
