const { Router } = require('express');
const router = Router();
const { creartipo } = require('../../controllers/tipo_solicitud/tipo_solicitud.controlador');
const {  crearSolicitud, mostarSolicitudes } = require('../../controllers/solicitud/solicitud.controlador');
const { validarJWT, validarDeJWTRoleCliente } = require('../../middlewares/validar-jwt');

router.post('/tipo/',  creartipo);
router.post('/', [validarJWT, validarDeJWTRoleCliente], crearSolicitud);
router.get('/mis-solicitudes/', [validarJWT, validarDeJWTRoleCliente], mostarSolicitudes);

module.exports = router;