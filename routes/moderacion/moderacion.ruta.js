/**
 * ruta /api/moderacion
 */

const { Router } = require("express");
const { crearReporte } = require("../../controllers/moderacion/moderacion.controler");
const {validarJWT, retornarDatosJWT} = require("../../middlewares/validar-jwt");




const router = Router();

router.post('/crear-reporte/',[validarJWT], crearReporte);



module.exports = router;