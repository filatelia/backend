const { Router } = require('express');
const router = Router();
const { creartipo } = require('../../controllers/tipo_solicitud/tipo_solicitud.controlador');
const {  crearSolicitud, mostarSolicitudes, mostarSolicitudesTotales, aprobacion } = require('../../controllers/solicitud/solicitud.controlador');
const { validarJWT, validarDeJWTRoleCliente, validarDeJWTRoleAdmin } = require('../../middlewares/validar-jwt');

router.post('/tipo/',  creartipo);
router.post('/', [validarJWT, validarDeJWTRoleCliente], crearSolicitud);
router.get('/mis-solicitudes/', [validarJWT, validarDeJWTRoleCliente], mostarSolicitudes);
router.get('/', [validarJWT, validarDeJWTRoleAdmin], mostarSolicitudesTotales);
router.post('/aprobacion', [validarJWT, validarDeJWTRoleAdmin], aprobacion);

module.exports = router;