const { Router } = require("express");
const router = Router();
const {
  mostrarCatalogo,
} = require("../../controllers/catalogo/catalogo.controlador");
router.get("/:name", mostrarCatalogo);

module.exports = router;
