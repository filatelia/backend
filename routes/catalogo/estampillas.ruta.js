/*
    Ruta: /api/estampillas/
*/
const { Router } = require("express");
const router = Router();

const {
  crearEstampillaIndividual,
  editarEstampillaIndividual,
} = require("../../controllers/catalogo/estampillas.controlador");
const {
  validarJWT,
  validarDeJWTRoleAdmin,
} = require("../../funciones/validar-jwt");
const {
  validarDatosRecibidosCrearEstampilla,
} = require("../../funciones/validar-campos");
const {
  crearVariantesYErrores,
} = require("../../controllers/catalogo/variantes-errores.controlador");
const {
  createImageEstampilla,
} = require("../../controllers/catalogo/uploads.controlador");

//router.post('/', [validarJWT, validarDatosRecibidosCrearEstampilla, crearVariantesYErrores], crearEstampillaIndividual);
router.post(
  "/",
  [validarDatosRecibidosCrearEstampilla],
  crearEstampillaIndividual
);
router.post("/crear-imagen", [], createImageEstampilla);
router.post(
  "/editar-individual",
  [validarDeJWTRoleAdmin],
  editarEstampillaIndividual
);

module.exports = router;
