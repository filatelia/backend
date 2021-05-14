/**
 * ruta /api/moderacion
 */

const { Router } = require("express");
const {
  crearReporte,
  todosMensajesCliente,
  mostrarTodosReportes,
  cambiarEstadoReporte,
  todosTipoEstadoReporte,
  mostrarTodosReportesSinAnalizar,
} = require("../../controllers/moderacion/moderacion.controler");
const {
  validarJWT,
  retornarDatosJWT,
  validarDeJWTRoleAdmin,
} = require("../../funciones/validar-jwt");
const {
  validarDatoscambiarEstadoReporte,
} = require("../../funciones/validar-campos");

const router = Router();

router.post("/crear-reporte/", [validarJWT], crearReporte);
router.get(
  "/mostrar-todos-reportes/",
  [validarJWT, validarDeJWTRoleAdmin],
  mostrarTodosReportes
);
router.post(
  "/cambiar-estado-reporte/",
  [validarJWT, validarDeJWTRoleAdmin, validarDatoscambiarEstadoReporte],
  cambiarEstadoReporte
);
router.get(
  "/reportes-analizar/",
  [validarJWT, validarDeJWTRoleAdmin],
  mostrarTodosReportesSinAnalizar
);
router.get(
  "/tipos-estados-reporte/",
  [validarJWT, validarDeJWTRoleAdmin],
  todosTipoEstadoReporte
);
router.get(
  "/chats-reportado/:idCliente",
  [validarJWT, validarDeJWTRoleAdmin],
  todosMensajesCliente
);

module.exports = router;
