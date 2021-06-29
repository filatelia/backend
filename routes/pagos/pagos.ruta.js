/**
 * ruta -> api/pagos/
 *
 */
 const { Router } = require("express");

 
 const router = Router();
 const { crearCuentaBancaria, ConsultarCuentaBancaria, editarCuentaBancaria, eliminarCuentaBancaria } = require("../../controllers/pagos/cuentasBancarias.controlador");
const { crearPago, executePayment, configurarPaypal, consultarPaypal } = require("../../controllers/paypal/paypal.controlador")

 router.post("/bancos/crear-cuenta", crearCuentaBancaria);
 router.get("/bancos/cuenta/:usuario", ConsultarCuentaBancaria);
 router.put("/bancos/cuenta/", editarCuentaBancaria);
 router.delete("/bancos/cuenta/:usuario", eliminarCuentaBancaria);
 router.post("/compra", crearPago);
 router.get("/execute-payment", executePayment);
 router.post("/configurar-paypal", configurarPaypal);
 router.get("/credenciales-paypal", consultarPaypal);

 

 
 //router.post( '/agregar/', agregarSerieMancolista );
 //router.post( '/', verMancolistCatId );
 
 module.exports = router;
 