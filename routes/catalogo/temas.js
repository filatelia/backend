/*
    Ruta: /api/catalogo/temas
*/
const { Router } = require('express');
const { getTemas } = require('../../controllers/catalogo/temas.controlador');
const { validarJWT } = require('../../middlewares/validar-jwt');
const router = Router();

router.get( '/',[validarJWT], getTemas);

module.exports = router;