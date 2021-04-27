/**
 * Ruta: /api/tienda
 */

const { Router } = require("express");
const { listarProductosPorIdUsuario, 
    listarTodosProductos, 
    agregarFotosProducto, 
    crearProducto, 
    crearCategoria, 
    buscarCategoriaId, 
    listarTodasCategorias, 
    eliminarFotosProducto,
    listarProductosIdCategoria,
    modificarProducto 
} = require("../../controllers/tienda/productos.controlador")

const router = Router();



////////////////////////// CATEGORÍAS /////////////////////////////

////CREAR CATEGORÍA////
router.post('/categorias', [], crearCategoria);

////BUSCAR CATEGORÍA POR ID////
router.get('/categorias', [], buscarCategoriaId);

////LISTAR TODAS LAS CATEGORÍAS////
router.get('/categorias/todas', [], listarTodasCategorias);


///////////////////////////// PRODUCTOS /////////////////////////////

////CREAR UN NUEVO PRODUCTO ////
router.post('/producto', [], crearProducto);


/////MODIFICAR DATOS PRODUCTO //////
router.put('/producto', [], modificarProducto);



/////ELIMINAR PRODUCTO //////



////LISTAR PRODUCTOS POR USUARIO ////
router.get('/producto/:idUsuario', [], listarProductosPorIdUsuario);


////LISTAR TODOS LOS PRODUCTOS ////
router.get('/producto/', [], listarTodosProductos);

////LISTAR TODOS LOS PRODUCTOS POR CATEGORIA ////
router.get('/productos-cat/:idCat', [], listarProductosIdCategoria);




////ELIMINAR IMAGEN DE UN PRODUCTO ////
router.delete('/producto/imagen', [], eliminarFotosProducto);

////AGREGAR IMAGEN DE UN PRODUCTO ////
router.post('/producto/imagen/', [], agregarFotosProducto);








module.exports = router;