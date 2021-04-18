
 /**
  * ruta -> api/pruebas
  * 
  */
const { Router } = require('express');
const { generarExcel } = require('../../controllers/pruebas/excel');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const { consultarMensajeConIdClienteIdMensaje, paPruebas  } = require('../../middlewares/reportes')

const router = Router();

router.get( '/', generarExcel );
router.post( '/', paPruebas );

module.exports = router;
