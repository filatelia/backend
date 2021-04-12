/*
    Ruta: /api/variantes-errores/
*/
const { Router } = require('express');
const router = Router();
const { crearVariantesYErrores } = require('../../controllers/catalogo/variantes-errores.controlador');


router.post('/', crearVariantesYErrores);

module.exports = router;



