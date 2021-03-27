/*
    Ruta: /api/catalogo/tipo-catalogo
*/
const { Router } = require('express');
const router = Router();

const { validarJWT } = require('../../middlewares/index.middle');
const { mostrarTipoCatalogos } = require("../../middlewares/tipo_catalogo");
router.post( '/', [validarJWT], mostrarTipoCatalogos);

module.exports = router;