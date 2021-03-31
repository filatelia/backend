const { Router } = require('express');
const { deExcelAJson } = require('../../controllers/pruebas/excel');
const router = Router();

router.get( '/', deExcelAJson );

module.exports = router;
