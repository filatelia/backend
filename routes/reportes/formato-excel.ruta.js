/*
    Ruta: /api/reportes/generar-excel/
*/
const { Router } = require('express');
const { generarExcel, generarExcelFormularios } = require('../../controllers/catalogo/generar_formato.controlador');

const router = Router();

router.get('/generar-excel/', generarExcelFormularios);

module.exports = router;