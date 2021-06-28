/**
 * ruta -> api/pagos/
 *
 */
 const { Router } = require("express");

 
 const router = Router();
 const { crearCuentaBancaria, ConsultarCuentaBancaria, editarCuentaBancaria, eliminarCuentaBancaria } = require("../../controllers/pagos/cuentasBancarias.controlador");
const { crearPago, executePayment } = require("../../controllers/paypal/paypal.controlador")

 router.post("/bancos/crear-cuenta", crearCuentaBancaria);
 router.get("/bancos/cuenta/:usuario", ConsultarCuentaBancaria);
 router.put("/bancos/cuenta/", editarCuentaBancaria);
 router.delete("/bancos/cuenta/:usuario", eliminarCuentaBancaria);
 router.post("/compra", crearPago);
 router.get("/execute-payment", executePayment);
 

 
 //router.post( '/agregar/', agregarSerieMancolista );
 //router.post( '/', verMancolistCatId );
 
 module.exports = router;
 