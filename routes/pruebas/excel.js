
 /**
  * ruta -> api/pruebas
  * 
  */
const { Router } = require('express');
const { generarExcel } = require('../../controllers/pruebas/excel');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const { consultarMensajeConIdClienteIdMensaje, paPruebas  } = require('../../middlewares/reportes')
const { agregarSerieMancolista, verMancolistCatId } = require('../../controllers/catalogo/manco_list.controlador');


const router = Router();

router.get( '/', generarExcel );
router.post( '/agregar/', agregarSerieMancolista );
router.post( '/', verMancolistCatId );

module.exports = router;
