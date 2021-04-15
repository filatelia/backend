/**
 * ruta /api/moderacion
 */

const { Router } = require("express");
const { crearReporte, mostrarTodosReportes,  cambiarEstadoReporte } = require("../../controllers/moderacion/moderacion.controler");
const {validarJWT, retornarDatosJWT, validarDeJWTRoleAdmin} = require("../../middlewares/validar-jwt");
const {validarDatoscambiarEstadoReporte} = require("../../middlewares/validar-campos");





const router = Router();

router.post('/crear-reporte/',[validarJWT], crearReporte);
router.get('/mostrar-todos-reportes/',[validarJWT, validarDeJWTRoleAdmin], mostrarTodosReportes);
router.post('/cambiar-estado-reporte/',[validarJWT, validarDeJWTRoleAdmin, validarDatoscambiarEstadoReporte], cambiarEstadoReporte);



module.exports = router;