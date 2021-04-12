/*
    Ruta: /api/estampillas/
*/
const { Router } = require('express');
const router = Router();

const { crearEstampillaIndividual } = require('../../controllers/catalogo/estampillas.controlador');
const { validarJWT } = require('../../middlewares/validar-jwt');
const { validarDatosRecibidosCrearEstampilla } = require('../../middlewares/validar-campos');
const { crearVariantesYErrores } = require('../../controllers/catalogo/variantes-errores.controlador');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');


//router.post('/', [validarJWT, validarDatosRecibidosCrearEstampilla, crearVariantesYErrores], crearEstampillaIndividual);
router.post('/', [validarDatosRecibidosCrearEstampilla], crearEstampillaIndividual);
router.post('/crear-imagen', [], createImageEstampilla);



module.exports = router;
