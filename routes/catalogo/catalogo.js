/*
    Ruta: api/catalogo/uploads/excel/
*/
const { Router } = require('express');
const router = Router();
const {obtenerIdCatPaisTema, listarCatalogosIdUsuario,  mostrarCatalogoPais,mostrarCatalogoId,
    estampillaPage, mostrarCatalogoAnio, mostrarMisEstampillas, mostrarMisCatalogos, 
    crearCatalogo, mostrarCatalogo, eliminarCatalogo, 
    editarCatExcel } = require('../../controllers/catalogo/catalogo.controlador');
const { subirEstampillasExcel } = require('../../controllers/catalogo/estampillas.controlador');
const { verificarTemaYCrearlo } = require('../../middlewares/excel');
const { validarJWT,validarDeJWTRoleAdmin } = require('../../middlewares/index.middle');



//router.post( '/', [validarJWT, validarDeJWTRoleAdmin, verificarTemaYCrearlo ], crearCatalogo);
//router.post( '/', [ ], crearCatalogo);
router.post( '/', [ ], subirEstampillasExcel);
router.delete( '/:id', [ ], eliminarCatalogo);
router.put( '/actualizar-cat-excel', [ ], editarCatExcel);

router.get( '/', [], mostrarCatalogo);
router.get( '/mis-catalogos/', [validarJWT], mostrarMisCatalogos);
router.get( '/catalogos/:id', [validarJWT], mostrarCatalogoId);
router.get( '/mis-estampillas', [validarJWT], mostrarMisEstampillas);
router.get( '/paises/:pais', [], mostrarCatalogoPais);
router.get( '/cat-anio/:anioI&:anioF', [], mostrarCatalogoAnio);
router.get('/estampillas',[],estampillaPage);
router.get('/catalogos-id-usuario/:idUsuario',[validarDeJWTRoleAdmin], listarCatalogosIdUsuario);

router.get('/obtener-id-catalogo',[], obtenerIdCatPaisTema);


module.exports = router;