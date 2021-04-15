/**
 * ruta /api/moderacion
 */

const { Router } = require("express");
const { crearReporte, mostrarTodosReportes,  darBaja } = require("../../controllers/moderacion/moderacion.controler");
const {validarJWT, retornarDatosJWT, validarDeJWTRoleAdmin} = require("../../middlewares/validar-jwt");




const router = Router();

router.post('/crear-reporte/',[validarJWT], crearReporte);
router.get('/mostrar-todos-reportes/',[validarJWT, validarDeJWTRoleAdmin], mostrarTodosReportes);
router.get('/dar-baja/:idReporte',[validarJWT, validarDeJWTRoleAdmin], darBaja);
router.get('/ignorar-reporte/:idReporte',[validarJWT, validarDeJWTRoleAdmin], darBaja);



module.exports = router;