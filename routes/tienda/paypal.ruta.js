/**
 * api/paypal
 */
const { Router } = require("express");
const { crearPago } = require("../../controllers/tienda/paypal.controlador");
const router = Router();

router.post("/", [], crearPago);

module.exports = router;
