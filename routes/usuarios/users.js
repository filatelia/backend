const { Router } = require('express');
const router = Router();

const { getUsuario, createUsuario, updateUusuario, deleteUsuario } = require('../../controllers/usuario/usuario');
const { validarJWT, validarDeJWTRoleAdmin } = require('../../middlewares/validar-jwt');
const { validarExistenciaUsuario, validarEmailDiferenteActualizar } = require('../../middlewares/validarUsuario');

//Rutas para manejar usuarios donde se hacen las validaciones antes de entrar a la ruta

router.get( '/',validarJWT,getUsuario );
router.post('/', [ validarJWT,  validarDeJWTRoleAdmin, validarExistenciaUsuario] , createUsuario);
//router.post('/', createUsuario );
router.put('/', [validarJWT, validarEmailDiferenteActualizar], updateUusuario);
router.delete('/:id', [validarJWT, validarDeJWTRoleAdmin], deleteUsuario);

module.exports = router;