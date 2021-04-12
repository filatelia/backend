const { Router } = require('express');
const router = Router();

const { getUsuario, createUsuario, updateUusuario, deleteUsuario,getUsuarioId } = require('../../controllers/usuario/usuario');
const { validarJWT, validarDeJWTRoleAdmin } = require('../../middlewares/validar-jwt');
const { validarExistenciaUsuario, validarEmailDiferenteActualizar, validarDatosRecibidosUsuarios } = require('../../middlewares/validarUsuario');
const { generarTMes } = require('../../controllers/auth/login');

//Rutas para manejar usuarios donde se hacen las validaciones antes de entrar a la ruta

router.get( '/',validarJWT,getUsuario );
router.get('/checked-token',[validarJWT],getUsuarioId );
router.post('/', [validarDatosRecibidosUsuarios, validarExistenciaUsuario] , createUsuario);
//router.post('/', createUsuario );
router.put('/', [validarJWT, validarEmailDiferenteActualizar], updateUusuario);
router.delete('/:id', [validarJWT, validarDeJWTRoleAdmin], deleteUsuario);

module.exports = router;