
 /**
  * ruta -> api/pruebas
  * 
  */
const { Router } = require('express');
const { generarExcel, generarExcelFormularios  } = require('../../controllers/catalogo/generar_formato.controlador');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const { consultarMensajeConIdClienteIdMensaje, paPruebas  } = require('../../middlewares/reportes')
const { agregarSerieMancolista, verMancolistCatId } = require('../../controllers/catalogo/manco_list.controlador');
const { recibirExcelFormularios, guardarImagenDirectorioBase64 } = require('../../controllers/pruebas/excel')
const { googlePruebas } = require('../../controllers/google/google.controlador')

const router = Router();

router.post( '/google/', googlePruebas  );
router.post( '/guardar-base64/', guardarImagenDirectorioBase64  );

//router.post( '/agregar/', agregarSerieMancolista );
//router.post( '/', verMancolistCatId );

module.exports = router;
