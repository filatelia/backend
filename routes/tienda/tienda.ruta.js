/**
 * Ruta: /api/tienda
 */

const { Router } = require("express");
const {
  listarProductosPorIdUsuario,
  listarTodosProductos,
  agregarFotosProducto,
  crearProducto,
  crearCategoria,
  buscarCategoriaId,
  listarTodasCategorias,
  eliminarFotosProducto,
  listarProductosIdCategoria,
  modificarProducto,
  mostrarProductoPorIdProducto,
  eliminarProductoIdProducto,
  consultarTodasMonedasPaypalCtr,
  converirADolarPagarPaypalCtr,
  valorInicialFinalProductoCtr
} = require("../../controllers/tienda/productos.controlador");

const router = Router();
//
//
//
////////////////////////// CATEGORÍAS /////////////////////////////

//1//CREAR CATEGORÍA////
router.post("/categorias", [], crearCategoria);

//2//BUSCAR CATEGORÍA POR ID////
router.get("/categorias", [], buscarCategoriaId);

///3/LISTAR TODAS LAS CATEGORÍAS////
router.get("/categorias/todas", [], listarTodasCategorias);

//
//
//
///////////////////////////// PRODUCTOS /////////////////////////////

////4CREAR UN NUEVO PRODUCTO ////
router.post("/producto", [], crearProducto);

//5///MODIFICAR DATOS PRODUCTO //////
router.put("/producto/individual", [], modificarProducto);

//10 //MOSTRAR PRODUCTO POR ID PRODUCTO///////
router.get(
    "/producto/individual/:idProducto",
    [],
    mostrarProductoPorIdProducto
  );
  
///6//ELIMINAR PRODUCTO //////
router.delete("/producto/individual/:idProducto", [], eliminarProductoIdProducto);

//7//LISTAR PRODUCTOS POR USUARIO ////
router.get("/producto/:idUsuario", [], listarProductosPorIdUsuario);

//8//LISTAR TODOS LOS PRODUCTOS ////
router.get("/producto/", [], listarTodosProductos);

//9//LISTAR TODOS LOS PRODUCTOS POR CATEGORIA ////
router.get("/productos-cat/:idCat", [], listarProductosIdCategoria);


//11//ELIMINAR IMAGEN DE UN PRODUCTO ////
router.delete("/producto/imagen", [], eliminarFotosProducto);

//12//AGREGAR IMAGEN DE UN PRODUCTO ////
router.post("/producto/imagen/", [], agregarFotosProducto);

module.exports = router;

//13 ////// VALOR MÍNIMO - VALOR MÁXIMO
router.get("/producto/valores/:idProducto", [], valorInicialFinalProductoCtr);


//
//
//
///////////////////////////// PAGOS /////////////////////////////

//LISTAR TODAS LAS MONEDAS ACEPTADAS POR PAYPAL
router.get("/pagos/monedas/", [], consultarTodasMonedasPaypalCtr);

//CAMBIO DE MONEDA, CUANDO SE SELECCIONE PAYPAL
router.get("/pagos/conversion/", [], converirADolarPagarPaypalCtr);
