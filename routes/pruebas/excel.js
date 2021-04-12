const { Router } = require('express');
const { generarExcel } = require('../../controllers/pruebas/excel');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const router = Router();

router.get( '/', generarExcel );
router.post( '/', createImageEstampilla );

module.exports = router;
