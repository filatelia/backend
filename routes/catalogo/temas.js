/*
    Ruta: /api/catalogo/temas
*/
const { Router } = require('express');
const { getTemas,getTema, mostrarDatosDuenio, validarDatosRecibidosMostrarDatosDuenio } = require('../../controllers/catalogo/temas.controlador');
const { validarJWT } = require('../../middlewares/validar-jwt');
const router = Router();

router.get( '/',[], getTemas);
router.get( '/:tema',[], getTema);
router.get( '/solicitud/:nombre-tema',[validarJWT, validarDatosRecibidosMostrarDatosDuenio], mostrarDatosDuenio);

module.exports = router;