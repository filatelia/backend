/*
    Ruta: /api/catalogo/temas
*/
const { Router } = require('express');
const { getTemas,getTema } = require('../../controllers/catalogo/temas.controlador');
const { validarJWT } = require('../../middlewares/validar-jwt');
const router = Router();

router.get( '/',[], getTemas);
router.get( '/:tema',[], getTema);

module.exports = router;