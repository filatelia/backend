/**
 * Ruta: /api/tienda
 */

const { Router } = require("express");
const { consultarTodosLosColores, consultarColorConID } = require("../../controllers/tienda/colores.controlador")
const { crearProducto, crearCategoria, buscarCategoriaId, listarTodasCategorias } = require("../../controllers/tienda/productos.controlador")

const router = Router();

/////// COLORES //////

router.get('/colores/', [], consultarTodosLosColores);
router.get('/color/', [], consultarColorConID);

/////// CATEGORÍAS //////

router.post('/categorias', [], crearCategoria);
router.get('/categorias', [], buscarCategoriaId);
router.get('/categorias/todas', [], listarTodasCategorias);

/////// PRODUCTOS //////
router.post('/producto', [], crearProducto);




module.exports = router;