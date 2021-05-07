/*
    Ruta: /api/catalogo/tipo-catalogo
*/
const { Router } = require("express");
const router = Router();

const { validarJWT } = require("../../funciones/index.middle");
const { mostrarTipoCatalogos } = require("../../funciones/tipo_catalogo");
router.post("/", [], mostrarTipoCatalogos);

module.exports = router;
