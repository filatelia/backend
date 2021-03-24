/*
    Ruta: /api/catalogo/
*/
const { Router } = require('express');
const router = Router();
const { mostrarCatalogoPais,mostrarCatalogoId, mostrarCatalogoAnio, mostrarMisEstampillas, mostrarMisCatalogos, crearCatalogo, mostrarCatalogo, eliminarCatalogo, editarCatExcel } = require('../../controllers/catalogo/catalogo.controlador');
const { verificarTemaYCrearlo } = require('../../middlewares/excel');
const { validarJWT,validarDeJWTRoleAdmin } = require('../../middlewares/index.middle');



//router.post( '/', [validarJWT, validarDeJWTRoleAdmin, verificarTemaYCrearlo ], crearCatalogo);
router.post( '/', [ ], crearCatalogo);
router.delete( '/:id', [validarJWT ], eliminarCatalogo);
router.put( '/actualizar-cat-excel', [validarJWT ], editarCatExcel);

router.get( '/', [], mostrarCatalogo);
router.get( '/mis-catalogos/', [validarJWT], mostrarMisCatalogos);
router.get( '/catalogos/:id', [validarJWT], mostrarCatalogoId);
router.get( '/mis-estampillas/', [validarJWT], mostrarMisEstampillas);
router.get( '/paises/:pais', [], mostrarCatalogoPais);
router.get( '/cat-anio/:anioI&:anioF', [], mostrarCatalogoAnio);


module.exports = router;