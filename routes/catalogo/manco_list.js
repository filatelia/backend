/*
    Ruta: /api/catalogo/manco_list/:idu
*/
const { Router } = require('express');
const router = Router();
const { actualizarMancolist, validarMancolist, compartirManco_list,verMancolistCatId, verMancolistPropia,catMancolist,getMancoListCat } = require('../../controllers/catalogo/manco_list.controlador');
const { validarJWT } = require("../../middlewares/validar-jwt");

router.get( '/listar/:id', compartirManco_list);
router.post( '/',[validarJWT], actualizarMancolist);
router.post( '/create-cat',[validarJWT], catMancolist);
router.put( '/update-cat',[validarJWT], catMancolist);
router.get( '/manco-list-cat',[validarJWT], getMancoListCat);
router.post( '/validar/',[validarJWT], validarMancolist);

router.post( '/listar/',[validarJWT], verMancolistPropia);
router.get( '/listar-id-cat',[], verMancolistCatId);

module.exports = router;
//Adasdasdasgit