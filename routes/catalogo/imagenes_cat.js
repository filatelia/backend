/*
    Ruta: /api/catalogo/uploads
*/
const { Router } = require("express");
const {
  createImageCat,
  createImageTema,
} = require("../../controllers/catalogo/uploads.controlador");
const router = Router();
const {
  validarImg,
  verificarRepetida,
} = require("../../funciones/cat_imagenes");

router.post("/cat", [validarImg, verificarRepetida], createImageCat);
router.post("/temas", [validarImg, verificarRepetida], createImageTema);

module.exports = router;
