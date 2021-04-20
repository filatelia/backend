/*
    Ruta: /api/catalogo/paises
*/
const { Router } = require('express');
const { getPaisByName,getPaisCatalogo, getPaisById, getTodosPaises } = require('../../controllers/catalogo/pais.controlador');
const router = Router();

router.get( '/',getPaisCatalogo );
router.get( '/:name',getPaisByName );
router.get( '/pid/:pid',getPaisById );

module.exports = router;