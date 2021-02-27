const { Router } = require('express');
const { getUsuario, createUsuario, updateUusuario, deleteUsuario } = require('../../controllers/usuario/usuario');
const router = Router();
const { validarJWT } = require('../../middlewares/validar-jwt');
const { validarExistenciaUsuario } = require('../../middlewares/validarUsuario');

router.get( '/',validarJWT,getUsuario );
router.post('/', [validarJWT,  validarExistenciaUsuario] , createUsuario);
router.put('/:id', validarJWT, updateUusuario);
router.delete('/:id', validarJWT, deleteUsuario);

module.exports = router;