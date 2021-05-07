const { response } = require("express");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../funciones/validar-campos");
const {
  crearNuevoProducto,
  listarProductosPorIdCliente,
  borarImagenProducto,
  listarTodosProductosBD,
  listarTodosProductosBDPorIdCategoria,
  actuaizarProductoBD,
  listarProductosPorIdProducto,
  eliminarProductoYAsociados,
  agregarAlCarrito,
  listarProductosCarritoUsuario,
  eliminarProductoCarrito,
} = require("../../funciones/tienda");
const {
  crearNuevaCategoria,
  consultarTodasCategorias,
  consultarCategoriaIdCategoria,
} = require("../../funciones/categoria");
const {
  crearImagenDirectorio,
  guadarImagenEnBD,
  asociarImagenDeProductoConIdImagen,
  cambioImagenPrincipalProducto,
} = require("../../funciones/subir_imagen");
const {
  todasMonedasPaypalMD,
  consultarConvertirMonedaTiempoReal,
} = require("../../funciones/paypal");

const crearProducto = async (req, res = response) => {
  try {
    var {
      id_usuario,
      nombre_producto,
      categoria,
      tarifa_envio,
      cantidad_productos,
      tamanios,
    } = req.body;

    var { fotos_producto } = req.body;

    var tipo = typeof cantidad_productos;
    // console.log("Tipo ->", tipo);
    // if(tipo == "string") cantidad_productos = JSON.parse(cantidad_productos);

    if (!Array.isArray(req.body.fotos_producto)) {
      console.log("no es array");
      req.body.fotos_producto = [req.body.fotos_producto];
    }
    var fotos_producto = req.body.fotos_producto;
    console.log("");

    console.log("- Guardando Producto");
    ///////// VALIDACIONES ////////
    console.log(" - Validando información recibida");
    console.log("  | Validaciones OK");

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];
    arrayCamposValidar.push(nombre_producto);
    arrayCamposValidar.push(categoria);
    arrayCamposValidar.push(fotos_producto);
    arrayCamposValidar.push(tarifa_envio);
    arrayCamposValidar.push(tamanios);
    arrayCamposValidar.push(id_usuario);

    if (validarCamposGeneral(6, arrayCamposValidar) != true) {
      return res.json({
        ok: false,
        msg: "Debes enviar los datos obligatorios.",
      });
    }

    if (!Array.isArray(fotos_producto))
      return res.json({
        ok: false,
        msg: "Debes enviar un array de fotos_producto.",
      });

    arrayIdsValidar.push(categoria);
    arrayIdsValidar.push(id_usuario);

    if (
      isValidObjectIdGeneral(arrayIdsValidar.length, arrayIdsValidar) != true
    ) {
      return res.json({
        ok: false,
        msg: "Debes enviar los ids válidos.",
      });
    }
    console.log(" ⚫ Creando producto nuevo.");

    ///CREANDO IMAGEN DE PRODUCTO /////
    var imagenes = req.body.fotos_producto;
    req.body.fotos_producto = [];

    console.log(" - Procesado imágenes");

    for (let index = 0; index < imagenes.length; index++) {
      var objImagen = {};

      const element = imagenes[index];

      var imagenEnDirectorio = await crearImagenDirectorio("producto", element);

      if (imagenEnDirectorio.ok != true) {
        return res.json(imagenEnDirectorio);
      }
      console.log(
        "  | Imagen " + (index + 1) + " guarda en servidor correctamente."
      );

      objImagen.name = imagenEnDirectorio.nombreImagen;
      objImagen.imagen_url = imagenEnDirectorio.urlImagenBD;
      objImagen.tipo_imagen = "producto";

      var imagenGuardada = await guadarImagenEnBD(objImagen);
      if (imagenGuardada.ok != true) return res.json(imagenGuardada);

      console.log(
        "  | Información de imagen  " +
          (index + 1) +
          " guarada en base de datos."
      );
      req.body.fotos_producto.push(imagenGuardada.idImagenBD);
    }
    console.log(" | Imagenes Ok.");

    req.body.foto_principal = req.body.fotos_producto[0];

    /////////// CREANDO PRODUCTO ////////
    var nuevoProducto = await crearNuevoProducto(req.body);
    if (nuevoProducto.ok != true)
      return res.json({ ok: false, msg: nuevoProducto });

    console.log("☑ Producto creado correctamente.");
    return res.json({
      ok: true,
      msg: nuevoProducto.msg,
      producto_creado: nuevoProducto.producto._id,
    });
  } catch (error) {
    console.log("Error en catch de crearProducto | tienda controlador", error);
    return res.json({
      ok: false,
      msg: error,
    });
  }
};

const listarProductosPorIdUsuario = async (req, res = response) => {
  try {
    console.log("Entramos");
    const { idUsuario } = req.params;
    console.log("idUsuario", idUsuario);
    var listaBD = await listarProductosPorIdCliente(idUsuario);
    if (!listaBD.ok) return res.json(listaBD);

    return res.json(listaBD);
  } catch (error) {
    console.log("Error en catch de listarProductosPorIdUsuario ", error);
    return res.json({
      ok: false,
      msg: error,
      tipo_error: "Catch",
    });
  }
};

const crearCategoria = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      tipo_error: null,
      msg: "Catagoría creada correctamente.",
    });

    var arrayCamposValidar = [];
    const { nombre_categoria } = req.body;
    console.log(nombre_categoria);

    arrayCamposValidar.push(nombre_categoria);

    if (validarCamposGeneral(1, arrayCamposValidar) != true) {
      return res.json({
        ok: false,
        msg: "Debes enviar los datos obligatorios",
      });
    }

    var crearCategoriaBD = await crearNuevaCategoria(nombre_categoria);
    if (crearCategoriaBD.ok != true) {
      return res.json({ ok: false, msg: crearCategoriaBD });
    }
    return res.json(objetoRespuesta);
  } catch (error) {
    console.log("Error al  crear categoria, desde controlador tienda", error);

    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error al crear categoría.";

    return res.json(objetoRespuesta);
  }
};

const listarTodasCategorias = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    var categoriasBD = await consultarTodasCategorias();

    return res.json(categoriasBD);
  } catch (error) {
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error al lsitar todas las categorias";
    return res.json(objetoRespuesta);
  }
};

const buscarCategoriaId = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    var id = req.query.idCategoria;
    var arrayCamposValidar = [];

    arrayCamposValidar.push(id);

    if (validarCamposGeneral(1, arrayCamposValidar) != true)
      return res.json({
        ok: false,
        msg: "Debes enviar los datos obligatorios",
      });
    if (isValidObjectIdGeneral(1, arrayCamposValidar) != true)
      return res.json({ ok: false, msg: "Debes enviar un id válido." });

    var categoriasBD = await consultarCategoriaIdCategoria(id);

    return res.json(categoriasBD);
  } catch (error) {
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg =
      "Error al bsucar la categoria con el id proporcionado";
    return res.json(objetoRespuesta);
  }
};

const agregarFotosProducto = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    const { id_producto } = req.body;

    /////CREANDO IMAGEN DE PRODUCTO /////
    var imagenes = req.body.fotos_producto;
    if (!Array.isArray(imagenes)) imagenes = [imagenes];
    req.body.fotos_producto = [];

    console.log(" - Procesado imágenes");

    for (let index = 0; index < imagenes.length; index++) {
      var objImagen = {};

      const element = imagenes[index];

      var imagenEnDirectorio = await crearImagenDirectorio("producto", element);

      if (imagenEnDirectorio.ok != true) {
        return res.json(imagenEnDirectorio);
      }
      console.log(
        "  | Imagen " + (index + 1) + " guardada en servidor correctamente."
      );

      objImagen.name = imagenEnDirectorio.nombreImagen;
      objImagen.imagen_url = imagenEnDirectorio.urlImagenBD;
      objImagen.tipo_imagen = "producto";

      var imagenGuardada = await guadarImagenEnBD(objImagen);
      if (imagenGuardada.ok != true) return res.json(imagenGuardada);

      console.log(
        "  | Información de imagen  " +
          (index + 1) +
          " guarada en base de datos."
      );
      req.body.fotos_producto.push(imagenGuardada.idImagenBD);
    }

    console.log(" | Imagenes Ok.");

    console.log("req.body.fotos_producto", req.body.fotos_producto);
    var asociar = await asociarImagenDeProductoConIdImagen(
      id_producto,
      req.body.fotos_producto
    );

    if (!asociar.ok) {
      return res.json(asociar);
    }

    objetoRespuesta.msg = asociar;
    return res.json(objetoRespuesta);

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const eliminarFotosProducto = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    const { urlImagenBD, idImagen, idProducto } = req.query;
    console.log(req.query);

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(urlImagenBD);
    arrayCamposValidar.push(idImagen);
    arrayCamposValidar.push(idProducto);

    var validarCamposG = validarCamposGeneral(3, arrayCamposValidar);
    if (!validarCamposG)
      return res.json({ ok: false, msg: "Debes enviar los datos necesarios." });

    arrayIdsValidar.push(idImagen);
    arrayIdsValidar.push(idProducto);
    var validarIds = isValidObjectIdGeneral(2, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    var borrandoImagenProducto = await borarImagenProducto(
      urlImagenBD,
      idImagen,
      idProducto
    );

    return res.json(borrandoImagenProducto);

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const listarTodosProductos = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    ///Cuando todo sale ok/////
    var productosBD = await listarTodosProductosBD();

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const listarProductosIdCategoria = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    const { idCat } = req.params;

    ///Cuando todo sale ok/////
    var productosBD = await listarTodosProductosBDPorIdCategoria(idCat);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch listarProductosIdCategoria");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
    return res.json(objetoRespuesta);
  }
};

const modificarProducto = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    const { id_producto, categoria } = req.body;

    ////Validaciones////
    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(id_producto);

    var validarCamposG = validarCamposGeneral(1, arrayCamposValidar);
    if (!validarCamposG)
      return res.json({ ok: false, msg: "Debes enviar el id del producto." });

    arrayIdsValidar.push(id_producto);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({
        ok: false,
        msg: "Debes enviar id producto válido válido.",
      });

    if (categoria) {
      arrayCamposValidar = [];
      arrayCamposValidar.push(categoria);

      var validarCamposGe = validarCamposGeneral(1, arrayCamposValidar);
      if (!validarCamposGe)
        return res.json({ ok: false, msg: "Debes enviar el id del producto." });

      arrayIdsValidar = [];
      arrayIdsValidar.push(categoria);

      var validarIdse = isValidObjectIdGeneral(1, arrayIdsValidar);
      if (!validarIdse)
        return res.json({
          ok: false,
          msg: "Debes enviar id categoría válido.",
        });
    }

    var productoActuzado = await actuaizarProductoBD(req.body);

    return res.json(productoActuzado);
  } catch (error) {
    console.log("Error en catch");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
    return res.json(objetoRespuesta);
  }
};

const eliminarProductoIdProducto = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idProducto } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idProducto);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    console.log("");
    console.log("⚫ Eliminando producto.");
    var productosBD = await eliminarProductoYAsociados(idProducto);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch eliminarProductoIdProducto", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch eliminarProductoIdProducto";
    return res.json(objetoRespuesta);
  }
};

const mostrarProductoPorIdProducto = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idProducto } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idProducto);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    var productosBD = await listarProductosPorIdProducto(idProducto);
    var valores = [];
    var stock = 0;
    productosBD.msg.tamanios.map((data) => {
      if (data.precio_descuento) {
        valores.push(data.precio_descuento);
      } else {
        valores.push(data.precio);
      }
      data.colores.map((dat) => (stock = stock + dat.cantidad));
    });
    var valorMinimo = Math.min(...valores);
    var valorMaximo = Math.max(...valores);
    productosBD.valorMaximo = valorMaximo;
    productosBD.valorMinimo = valorMinimo;
    productosBD.stock = stock;

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch mostrarProductoPorIdProducto", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch mostrarProductoPorIdProducto";
    return res.json(objetoRespuesta);
  }
};

const consultarTodasMonedasPaypalCtr = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    var todasMonedasPaypal = await todasMonedasPaypalMD();
    return res.json(todasMonedasPaypal);

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";

    return res.json(objetoRespuesta);
  }
};

const converirADolarPagarPaypalCtr = async (req, res = response) => {
  try {
    ///////ASIGNACIÓN DE DATO RECIBIDO ///////
    const { valor } = req.query;

    //////////// VALIDACIONES ////////////
    var arrayCamposValidar = [];

    arrayCamposValidar.push(Number(valor));

    var validarCamposG = validarCamposGeneral(1, arrayCamposValidar);

    /////DECLARANDO OBJETO A RESPONDER SOLICITUD ///////
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      soles: Number(valor),
      usd: null,
      tipo_error: null,
    });

    if (!validarCamposG) {
      objetoRespuesta.ok = false;
      objetoRespuesta.msg = "Debes enviar un valor a convertir.";
      objetoRespuesta.tipo_error = "Dato no recibido.";

      return res.json(objetoRespuesta);
    }

    //////// CONVERSIÓN PEN - USD //////
    var conversion = await consultarConvertirMonedaTiempoReal(valor);

    ///////PROCESO DE CONVERSIÓN FALLIDO/////
    if (!conversion.ok) return res.json(conversion);

    ///////PROCESO DE CONVERSIÓN EXITOSO/////

    objetoRespuesta.msg = "Conversión realizada correctamente.";
    delete objetoRespuesta.tipo_error;
    objetoRespuesta.usd = conversion.usd;

    return res.json(objetoRespuesta);
  } catch (error) {
    console.log("Error en catch converirADolarPagarPaypalCtr" + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error faltal, ver tipo error.";
    return res.json(objetoRespuesta);
  }
};

const valorInicialFinalProductoCtr = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    const { idProducto } = req.params;
    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(idProducto);

    var validarCamposG = validarCamposGeneral(1, arrayCamposValidar);
    if (!validarCamposG)
      return res.json({ ok: false, msg: "Debes enviar los datos necesarios." });

    arrayIdsValidar.push(idProducto);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    var productoBD = await listarProductosPorIdProducto(idProducto);
    console.log("productoBD", productoBD);
    if (!productoBD.ok) return res.json(productoBD);

    var valores = [];
    var stock = 0;
    productoBD.msg.tamanios.map((data) => {
      if (data.precio_descuento) {
        valores.push(data.precio_descuento);
      } else {
        valores.push(data.precio);
      }
      data.colores.map((dat) => (stock = stock + dat.cantidad));
    });
    var valorMinimo = Math.min(...valores);
    var valorMaximo = Math.max(...valores);

    return res.json({
      ok: true,
      precioMinimo: valorMinimo,
      precioMaximo: valorMaximo,
      stock: stock,
    });

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch ";
    return objetoRespuesta;
  }
};

const cambiarImagenPrincipalProductoCtr = async (req, res = response) => {
  try {
    console.log("Decibidos ->", req.body);

    const { id_producto, id_foto } = req.body;

    const cambioImagenPrincipal = await cambioImagenPrincipalProducto(
      id_producto,
      id_foto
    );

    return res.json(cambioImagenPrincipal);

    ///Cuando todo sale ok/////
  } catch (error) {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    console.log("Error en catch cambiarImagenPrincipalProductoCtr " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch cambiarImagenPrincipalProductoCtr";
    return res.json(objetoRespuesta);
  }
};

const agregarAlCarritoCtr = async (req, res = response) => {
  console.log("Agregando producto a carrito de compras");

  try {
    const { producto, usuario, id_tamanio, id_color, cantidad } = req.body;

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(producto);
    arrayCamposValidar.push(usuario);
    arrayCamposValidar.push(id_tamanio);
    arrayCamposValidar.push(id_color);
    arrayCamposValidar.push(cantidad);

    var validarCamposG = validarCamposGeneral(5, arrayCamposValidar);
    if (!validarCamposG)
      return res.json({ ok: false, msg: "Debes enviar los datos necesarios." });

    arrayIdsValidar.push(producto);
    arrayIdsValidar.push(usuario);
    arrayIdsValidar.push(id_tamanio);
    arrayIdsValidar.push(id_color);

    var validarIds = isValidObjectIdGeneral(4, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    var carrito = await agregarAlCarrito(req.body);
    console.log(" | Producto agregado correctamente al carrito.");

    return res.json(carrito);
  } catch (error) {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    console.log("Error en catch agregarAlCarritoCtr. " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch agregarAlCarritoCtr. ";

    return res.json(objetoRespuesta);
  }
};

const mostrarProductosCarritoCtr = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idUsuario } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idUsuario);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    var productosBD = await listarProductosCarritoUsuario(idUsuario);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch mostrarProductosCarritoCtr", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch mostrarProductosCarritoCtr";
    return res.json(objetoRespuesta);
  }
};

const quitarProductoCarritoCtr = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idItemCarrito } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idItemCarrito);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    console.log("");
    console.log("⚫ Eliminando producto.");
    var productosBD = await eliminarProductoCarrito(idItemCarrito);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch eliminarProductoIdProducto", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch eliminarProductoIdProducto";
    return res.json(objetoRespuesta);
  }
};

module.exports = {
  crearProducto,
  crearCategoria,
  listarTodasCategorias,
  buscarCategoriaId,
  listarProductosPorIdUsuario,
  agregarFotosProducto,
  eliminarFotosProducto,
  listarTodosProductos,
  listarProductosIdCategoria,
  modificarProducto,
  eliminarProductoIdProducto,
  mostrarProductoPorIdProducto,
  consultarTodasMonedasPaypalCtr,
  converirADolarPagarPaypalCtr,
  valorInicialFinalProductoCtr,
  cambiarImagenPrincipalProductoCtr,
  agregarAlCarritoCtr,
  mostrarProductosCarritoCtr,
  quitarProductoCarritoCtr,
};
