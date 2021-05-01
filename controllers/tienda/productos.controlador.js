const { response } = require("express");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../middlewares/validar-campos");
const {
  crearNuevoProducto,
  listarProductosPorIdCliente,
  borarImagenProducto,
  listarTodosProductosBD,
  listarTodosProductosBDPorIdCategoria,
  actuaizarProductoBD,
  listarProductosPorIdProducto,
  eliminarProductoYAsociados,
} = require("../../middlewares/tienda");
const {
  crearNuevaCategoria,
  consultarTodasCategorias,
  consultarCategoriaIdCategoria,
} = require("../../middlewares/categoria");
const {
  crearImagenDirectorio,
  guadarImagenEnBD,
  asociarImagenDeProductoConIdImagen,
} = require("../../middlewares/subir_imagen");
const {
  todasMonedasPaypalMD,
  consultarConvertirMonedaTiempoReal,
} = require("../../middlewares/paypal");

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

    console.log("req.body.fotos_producto", req.body.fotos_producto);
    req.body.foto_principal = req.body.fotos_producto[0];

    console.log("req.body", req.body);
    /////////// CREANDO PRODUCTO ////////
    var nuevoProducto = await crearNuevoProducto(req.body);
    if (nuevoProducto.ok != true)
      return res.json({ ok: false, msg: nuevoProducto });

    return res.json({
      ok: true,
      msg: nuevoProducto.msg,
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
    var imagenes = req.files.fotos_producto;
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

    const {
      id_producto,
      nombre_producto,
      descripcion,
      categoria,
      precio_normal,
      precio_descuento,
      cantidad_productos,
      colores_hex,
      tarifa_envio,
      moneda_producto,
      tamanios,
    } = req.body;

    console.log("objetoRecibidoActualizar", req.body);
    console.log("nombre_producto", nombre_producto);

    ///////////////////// VALIDACIONES ///////////////////

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(nombre_producto);
    arrayCamposValidar.push(categoria);
    arrayCamposValidar.push(precio_normal);
    arrayCamposValidar.push(cantidad_productos);
    arrayCamposValidar.push(tarifa_envio);
    arrayCamposValidar.push(moneda_producto);
    arrayCamposValidar.push(tamanios);
    arrayCamposValidar.push(id_usuario);

    if (!Array.isArray(tamanios))
      return res.json({ ok: false, msg: "Debes enviar un array de tamaños." });

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

    //##////////////////// FIN VALIDACIONES ////////////////##///

    //////////////////// ACTUALIZANADO PRODUCTO /////////////////

    /**
     * Creando objeto con datos permitidos a actualizar
     */

    var objetoProducto = new Object({
      id_producto: id_producto,
      nombre_producto: nombre_producto,
      descripcion: descripcion,
      categoria: categoria,
      precio_normal: precio_normal,
      precio_descuento: precio_descuento,
      cantidad_productos: cantidad_productos,
      colores_hex: colores_hex,
      tarifa_envio: tarifa_envio,
      moneda_producto: moneda_producto,
      tamanios: tamanios,
    });

    var productoActuzado = await actuaizarProductoBD(objetoProducto);
    console.log("productoActuzado", productoActuzado);
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
};
