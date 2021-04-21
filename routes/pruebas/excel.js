
 /**
  * ruta -> api/pruebas
  * 
  */
const { Router } = require('express');
const { generarExcel, generarExcelFormularios  } = require('../../controllers/catalogo/generar_formato.controlador');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const { consultarMensajeConIdClienteIdMensaje, paPruebas  } = require('../../middlewares/reportes')
const { agregarSerieMancolista, verMancolistCatId } = require('../../controllers/catalogo/manco_list.controlador');
const { recibirExcelFormularios } = require('../../controllers/pruebas/excel')

const router = Router();

router.post( '/', generarExcelFormularios );
router.post( '/recibir-excel/', recibirExcelFormularios  );
//router.post( '/agregar/', agregarSerieMancolista );
//router.post( '/', verMancolistCatId );

module.exports = router;
