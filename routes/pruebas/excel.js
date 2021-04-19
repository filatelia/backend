
 /**
  * ruta -> api/pruebas
  * 
  */
const { Router } = require('express');
const { generarExcel } = require('../../controllers/catalogo/generar_formato.controlador');
const { createImageEstampilla } = require('../../controllers/catalogo/uploads.controlador');
const { consultarMensajeConIdClienteIdMensaje, paPruebas  } = require('../../middlewares/reportes')
const { agregarSerieMancolista, verMancolistCatId } = require('../../controllers/catalogo/manco_list.controlador');


const router = Router();

router.get( '/:id_catalogo', generarExcel );
router.post( '/agregar/', agregarSerieMancolista );
router.post( '/', verMancolistCatId );

module.exports = router;
