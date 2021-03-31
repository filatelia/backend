/*
    Ruta: /api/catalogo/manco_list/:idu
*/
const { Router } = require('express');
const router = Router();
const { actualizarMancolist, compartirManco_list, verMancolistPropia,createMancolist,getMancoListCat } = require('../../controllers/catalogo/manco_list.controlador');
const { validarJWT } = require("../../middlewares/validar-jwt");

router.get( '/listar/:id', compartirManco_list);
router.post( '/',[validarJWT], actualizarMancolist);
router.post( '/create-cat',[validarJWT], createMancolist);
router.get( '/manco-list-cat',[validarJWT], getMancoListCat);

router.post( '/listar/',[validarJWT], verMancolistPropia);

module.exports = router;
//Adasdasdasgit