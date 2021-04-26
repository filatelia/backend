/**
 * Ruta: /api/tienda
 */

const { Router } = require("express");
const { listarProductosPorIdUsuario, crearProducto, crearCategoria, buscarCategoriaId, listarTodasCategorias } = require("../../controllers/tienda/productos.controlador")

const router = Router();



/////// CATEGORÍAS //////

router.post('/categorias', [], crearCategoria);
router.get('/categorias', [], buscarCategoriaId);
router.get('/categorias/todas', [], listarTodasCategorias);

/////// PRODUCTOS //////
router.post('/producto', [], crearProducto);
router.get('/producto/:idUsuario', [], listarProductosPorIdUsuario);




module.exports = router;