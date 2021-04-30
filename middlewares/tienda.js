const Tienda = require("../models/tienda/tienda.modelo");
const {
  eliminarImagenServidor,
  eliminarImagenBDConId,
  desasociarImagenDeProductoConIdImagen,
} = require("./subir_imagen");

const crearNuevoProducto = async (objetoProducto) => {
  var objeto = new Object({
    ok: true,
    tipo_error: null,
    msg: "Se ha creado correctamente el producto",
    producto: null,
  });
  try {
    var objProducto = new Tienda(objetoProducto);
    var productoCreado = await objProducto.save();

    objeto.producto = productoCreado;

    return objeto;
  } catch (error) {
    console.log(
      "Error en catch crearNuevoProducto | middlewares tienda",
      error
    );
    objeto.ok = false;
    (objeto.tipo_error = error), (objeto.msg = "Error al crear producto.");

    return objeto;
  }
};

const actuaizarProductoBD = async (objetoProducto) => {
  var objeto = new Object({
    ok: true,
    tipo_error: null,
    msg: "Se ha creado actualizado el producto",
    producto: null,
  });
  try {
    var objProducto = new Tienda.findById(objetoProducto.id_producto);
    console.log("Obje pruducto bd", objProducto);
    var objetoProductoEd = objProducto(objetoProducto);
    console.log("objetoProductoEd con", objetoProductoEd);

    var productoActuzadoBD = await objetoProductoEd.save();
    console.log("productoActuzadoBD", productoActuzadoBD);

    objeto.producto = productoActuzadoBD;

    return objeto;
  } catch (error) {
    console.log(
      "Error en catch actuaizarProductoBD | middlewares tienda",
      error
    );
    objeto.ok = false;
    objeto.tipo_error = "" + error;
    objeto.msg = "Error al crear producto.";

    return objeto;
  }
};

const listarProductosPorIdCliente = async (id_usuario) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  try {
    const productoBD = await Tienda.find({ id_usuario });
    if (productoBD == null) {
      objetoRespuesta.msg = "El cliente no cuenta con productos asociados.";
      return objetoRespuesta;
    }

    objetoRespuesta.msg = productoBD;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de listarProductosPorIdCliente | middelwares tienda"
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = error;
    objetoRespuesta.tipo_error = "Catch.";

    return objetoRespuesta;
  }
};

const borarImagenProducto = async (urlImagen, idImagen, idProducto) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    //Eliminado imagen de la base de datos ////
    var imagenElimadaBD = await eliminarImagenBDConId(idImagen);
    if (!imagenElimadaBD.ok) return imagenElimadaBD;
    console.log("Imagen elimianda de la colección de imágenes");

    var imagenDesasociadaDeProducto = await desasociarImagenDeProductoConIdImagen(
      idProducto,
      idImagen
    );

    if (!imagenDesasociadaDeProducto.ok) {
      return imagenDesasociadaDeProducto;
    }
    console.log("Imagen desasociada del prducto");

    ///ELIMINADO IMAGEN DEL SERVIDOR //////
    var imagenElimadaServidor = eliminarImagenServidor(urlImagen);

    if (!imagenElimadaServidor) {
      objetoRespuesta.msg =
        "No se ha podido borrar la imagen del servidor, pero si de la base de datos de imagenes y desasociar del producto,.";
      return objetoRespuesta;
    }
    console.log("Imagen elimianda del servidor");

    objetoRespuesta.msg =
      "Imagen elimianda del servidor, de la base de datos y desasociada del producto.";
    return objetoRespuesta;

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error en catch de borarImagenProducto";
  }
};

const listarTodosProductosBD = async () => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    ///Cuando todo sale ok/////
    var productosBD = await Tienda.find();
    if (productosBD == null) {
      objetoRespuesta.msg = "No existen productos en la BD.";
      return objetoRespuesta;
    } else {
      objetoRespuesta.msg = productosBD;
      return objetoRespuesta;
    }
  } catch (error) {
    console.log("Error en catch de listarTodosProductosBD");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const listarTodosProductosBDPorIdCategoria = async (categoria) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    ///Cuando todo sale ok/////
    var productosBD = await Tienda.find({ categoria });
    if (productosBD == null) {
      objetoRespuesta.msg =
        "No existen productos con el id categoría en la BD.";
      return objetoRespuesta;
    } else {
      objetoRespuesta.msg = productosBD;
      return objetoRespuesta;
    }
  } catch (error) {
    console.log("Error en catch de listarTodosProductosBDPorIdCategoria");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const listarProductosPorIdProducto = async (_id) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  try {
    const productoBD = await Tienda.findById(_id);
    if (productoBD == null) {
      objetoRespuesta.msg = "El id no cuenta con productos asociados.";
      return objetoRespuesta;
    }

    objetoRespuesta.msg = productoBD;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de listarProductosPorIdCliente | middelwares tienda"
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "" + error;
    objetoRespuesta.tipo_error = "Catch.";

    return objetoRespuesta;
  }
};

const eliminarProductoYAsociados = async (_id) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  try {
    const productoBD = await Tienda.findByIdAndDelete(_id);
    if (productoBD == null) {
      objetoRespuesta.msg = "El id no cuenta con productos asociados.";
          return objetoRespuesta;
    }

    console.log("Producto eliminado: ", productoBD);

    objetoRespuesta.msg = productoBD;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de listarProductosPorIdCliente | middelwares tienda"
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = ""+error;
    objetoRespuesta.tipo_error = "Catch.";

    return objetoRespuesta;
  }
};

module.exports = {
  crearNuevoProducto,
  listarProductosPorIdCliente,
  borarImagenProducto,
  listarTodosProductosBD,
  listarTodosProductosBDPorIdCategoria,
  eliminarProductoYAsociados,
  actuaizarProductoBD,
  listarProductosPorIdProducto,
  
};
