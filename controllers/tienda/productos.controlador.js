const { response } = require("express");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../middlewares/validar-campos");
const { crearNuevoProducto } = require("../../middlewares/tienda");
const {
  crearNuevaCategoria,
  consultarTodasCategorias,
  consultarCategoriaIdCategoria,
} = require("../../middlewares/categoria");
const {
  crearImagenDirectorio,
  guadarImagenEnBD,
} = require("../../middlewares/subir_imagen");
const { v4: uuidv4 } = require("uuid");
const { crearCantidadColor } = require("../../middlewares/cantidad_color");

const crearProducto = async (req, res = response) => {
  try {
    var {
      nombre_producto,
      categoria,
      precio_normal,
      cantidad_productos,
      tarifa_envio,
      moneda_producto,
      id_usuario,
      tamanios,
    } = req.body;
    console.log("cantidad",cantidad_productos);

    var codigoProducto = uuidv4();

    var { fotos_producto } = req.files;
  
    var tipo = typeof cantidad_productos;
    // console.log("Tipo ->", tipo);
    // if(tipo == "string") cantidad_productos = JSON.parse(cantidad_productos);
    
    

    if (!Array.isArray(req.files.fotos_producto)) {
      console.log("no es array");
      req.files.fotos_producto = [req.files.fotos_producto];
    }
    var fotos_producto =     req.files.fotos_producto;
    cantidad_productos= JSON.parse(cantidad_productos);
    console.log("fotos", req.files.fotos_producto);

    

    


    console.log("- Guardando Producto");
    ///////// VALIDACIONES ////////
    console.log(" - Validando información recibida");
    console.log("  | Validaciones OK");

    var arrayCamposValidar = [];
    var arrayIdsValidar = [];
    arrayCamposValidar.push(nombre_producto);
    arrayCamposValidar.push(categoria);
    arrayCamposValidar.push(precio_normal);
    arrayCamposValidar.push(fotos_producto);
    arrayCamposValidar.push(cantidad_productos);
    arrayCamposValidar.push(tarifa_envio);
    arrayCamposValidar.push(moneda_producto);
    arrayCamposValidar.push(tamanios);
    arrayCamposValidar.push(id_usuario);
    

    if (validarCamposGeneral(8, arrayCamposValidar) != true) {
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
    if (!Array.isArray(cantidad_productos))
      return res.json({
        ok: false,
        msg: "Debes enviar un array cantidad_productos.",
      });
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

    /////CREANDO IMAGEN DE PRODUCTO /////
    var imagenes = req.files.fotos_producto;
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

    console.log("fotos_producto", fotos_producto);

    ////////// CREANDO CANTIDAD PRODUCTOS POR COLOR ///////////

    req.body.cantidad_productos = [];
    var crearCantidadColorB = await crearCantidadColor(cantidad_productos);
    console.log("cantidadColor", crearCantidadColorB);
    if (!crearCantidadColorB.ok) return res.json(crearCantidadColorB);

    console.log("cantidad", crearCantidadColorB.msg.length);
    crearCantidadColorB.msg.map((data) => {
      req.body.cantidad_productos.push(data._id);
    });

    console.log("Ids Color", req.body.cantidad_productos);

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
const listarProductosPorIdUsuario = async () =>{

  try {
    
  } catch (error) {
    
  }
}

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

module.exports = {
  crearProducto,
  crearCategoria,
  listarTodasCategorias,
  buscarCategoriaId,
};
