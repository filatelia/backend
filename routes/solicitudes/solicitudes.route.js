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
} = require("../../middlewares/validar-jwt");
const { validarNuevaSolicitud } = require("../../middlewares/index.middle");
const { mostrarDatosDuenioPorPais, validarDatosRecibidosMostrarDatosDuenioPais } = require('../../middlewares/solicitudes');


router.post("/tipo/", creartipo);
router.post("/", [validarJWT], crearSolicitud);
router.get(
  "/mis-solicitudes/",
  [validarJWT, validarDeJWTRoleCliente],
  mostarSolicitudes
);
router.get("/", [validarJWT, validarDeJWTRoleAdmin], mostarSolicitudesTotales);
router.get("/mostrar-usuario/:id_pais", [validarJWT, validarDatosRecibidosMostrarDatosDuenioPais], mostrarDatosDuenioPorPais);
router.post("/aprobacion", [validarJWT, validarDeJWTRoleAdmin], aprobacion);
router.get("/formato/:cantidad", [ ], mostrarDatosDuenioPorPais);

module.exports = router;
