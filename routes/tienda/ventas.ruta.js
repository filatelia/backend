/**
 * api/ventas
 */
 const { Router } = require("express");
 const { crearVenta } = require("../../controllers/tienda/ventas.controlador"); 
 const router =Router();
 
 router.post('/',[], crearVenta);
 
 module.exports = router;