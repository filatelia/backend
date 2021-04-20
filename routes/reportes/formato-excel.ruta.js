/*
    Ruta: /api/reportes/generar-excel/:id_catalogo
*/
const { Router } = require('express');
const { generarExcel } = require('../../controllers/catalogo/generar_formato.controlador');

const router = Router();

router.get('/generar-excel/:id_catalogo', generarExcel);

module.exports = router;