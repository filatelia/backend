const { Router } = require("express");
const router = Router();
const {
  creartipo,
} = require("../../controllers/tipo_solicitud/tipo_solicitud.controlador");
const {
  crearSolicitud,
  mostarSolicitudes,
  mostarSolicitudesTotales,
  aprobacion,
} = require("../../controllers/solicitud/solicitud.controlador");
const {
  validarJWT,
  validarDeJWTRoleCliente,
  validarDeJWTRoleAdmin,
} = require("../../funciones/validar-jwt");
const { validarNuevaSolicitud } = require("../../funciones/index.middle");
const {
  mostrarDatosDuenioPorPais,
  validarDatosRecibidosMostrarDatosDuenioPais,
} = require("../../funciones/solicitudes");

router.post("/tipo/", creartipo);
router.post("/", [validarJWT], crearSolicitud);
router.get(
  "/mis-solicitudes/",
  [validarJWT, validarDeJWTRoleCliente],
  mostarSolicitudes
);
router.get("/", [validarJWT, validarDeJWTRoleAdmin], mostarSolicitudesTotales);
router.get(
  "/mostrar-usuario/:id_pais",
  [validarJWT, validarDatosRecibidosMostrarDatosDuenioPais],
  mostrarDatosDuenioPorPais
);
router.post("/aprobacion", [validarJWT, validarDeJWTRoleAdmin], aprobacion);
router.get("/formato/:cantidad", [], mostrarDatosDuenioPorPais);

module.exports = router;
