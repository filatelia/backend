/**
 * ruta /api/moderacion
 */

const { Router } = require("express");
const { crearReporte, mostrarTodosReportes,  cambiarEstadoReporte, mostrarTodosReportesSinAnalizar } = require("../../controllers/moderacion/moderacion.controler");
const {validarJWT, retornarDatosJWT, validarDeJWTRoleAdmin} = require("../../middlewares/validar-jwt");
const {validarDatoscambiarEstadoReporte} = require("../../middlewares/validar-campos");





const router = Router();

router.post('/crear-reporte/',[validarJWT], crearReporte);
router.get('/mostrar-todos-reportes/',[validarJWT, validarDeJWTRoleAdmin], mostrarTodosReportes);
router.post('/cambiar-estado-reporte/',[validarJWT, validarDeJWTRoleAdmin, validarDatoscambiarEstadoReporte], cambiarEstadoReporte);
router.get('/reportes-analizar/',[validarJWT, validarDeJWTRoleAdmin], mostrarTodosReportesSinAnalizar);



module.exports = router;