/**
 * api/ventas
 */
 const { Router } = require("express");
 const { crearVenta, crearDatosEnvioCtr, mostrarDatosEnvioCtr } = require("../../controllers/tienda/ventas.controlador"); 
 const router =Router();
 
 router.post('/',[], crearVenta);
 router.post('/datos-envio/',[], crearDatosEnvioCtr);
 router.get('/datos-envio/:idDatosEnvio',[], mostrarDatosEnvioCtr);
 
 module.exports = router;