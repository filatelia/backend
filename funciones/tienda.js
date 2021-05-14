const Tienda = require("../models/tienda/tienda.modelo");
const Carrito = require("../models/tienda/carrito.modelo");
const {
  eliminarImagenServidor,
  eliminarImagenBDConId,
  desasociarImagenDeProductoConIdImagen,
} = require("./subir_imagen");
const { validarExistenciaEnListaDeseos } = require("./lista-deseos");

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
    msg: "Se ha actualizado actualizado el producto",
    producto: null,
  });
  try {
    var objProducto = await Tienda.findByIdAndUpdate(
      objetoProducto.id_producto,
      objetoProducto
    );

    objeto.producto = objProducto._id;

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

    var arr = [];
    productoBD.map((data) => {
      var producto = new Object({
        _id: null,
        nombre: true,
        descripcion: null,
        categoria: null,
        stock_total: null,
        foto_principal:null
      });

      producto._id = data._id;
      producto.nombre = data.nombre_producto;
      producto.descripcion = data.descripcion;
      producto.categoria = data.categoria.nombre_categoria;
      producto.foto_principal = data.foto_principal.imagen_url;

      var contador = 0;
      data.tamanios.map((re) => {
        re.colores.map((color) => {
          contador = color.cantidad + contador;
        });
      });
      producto.stock_total = contador;

      arr.push(producto);
    });

    objetoRespuesta.msg = arr;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de listarProductosPorIdCliente | middelwares tienda",
      error
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "" + error;
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
    console.log(" | Imagen eliminada de la colección de imágenes. ", idImagen);

    var imagenDesasociadaDeProducto = await desasociarImagenDeProductoConIdImagen(
      idProducto,
      idImagen
    );

    if (!imagenDesasociadaDeProducto.ok) {
      return imagenDesasociadaDeProducto;
    }
    console.log(" | Imagen desasociada del producto. ", idImagen);

    ///ELIMINADO IMAGEN DEL SERVIDOR //////
    var imagenElimadaServidor = eliminarImagenServidor(urlImagen);

    if (!imagenElimadaServidor) {
      objetoRespuesta.ok = false;
      objetoRespuesta.msg =
        "No se ha podido borrar la imagen del servidor, pero si de la base de datos de imagenes y desasociar del producto,.";
      return objetoRespuesta;
    }
    console.log(" | Imagen elimianda del servidor. ", idImagen);

    objetoRespuesta.msg =
      "Imagen elimianda del servidor, de la base de datos y desasociada del producto.";
    return objetoRespuesta;

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch borarImagenProducto " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch de borarImagenProducto";
  }
};

const listarTodosProductosBD = async (usuario) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    var productosBD = await Tienda.find();
    if (productosBD == null) {
      objetoRespuesta.msg = "No existen productos en la BD.";
      return objetoRespuesta;
    } else {
      var productosEvaluados = await listarProductosYSuIdListaDeseosConIdUsuario(
        productosBD,
        usuario
      );

      objetoRespuesta.msg = productosEvaluados;
      return objetoRespuesta;
    }
  } catch (error) {
    console.log("Error en catch de listarTodosProductosBD " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
    return objetoRespuesta;
  }
};

const listarTodosProductosBDPorIdCategoria = async (categoria, usuario) => {
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
      var productosEvaluados = await listarProductosYSuIdListaDeseosConIdUsuario(
        productosBD,
        usuario
      );

      objetoRespuesta.msg = productosEvaluados;
      return objetoRespuesta;
    }
  } catch (error) {
    console.log("Error en catch de listarTodosProductosBDPorIdCategoria");
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch";
  }
};

const listarProductosYSuIdListaDeseosConIdUsuario = async (
  productosBD,
  usuario
) => {
  var arrayProducto = [];

  for (let index = 0; index < productosBD.length; index++) {
    var producto = productosBD[index];
    var obje = new Object();

    obje.uid = producto._id;
    obje.idListaDeseos = null;
    obje.nombre_producto = producto.nombre_producto;
    obje.descripcion = producto.descripcion;
    obje.categoria = producto.categoria;
    obje.foto_principal = producto.foto_principal;
    obje.fotos_producto = producto.fotos_producto;
    obje.tamanios = producto.tamanios;
    obje.tarifa_envio_lima = producto.tarifa_envio_lima;
    obje.tarifa_envio_provincias = producto.tarifa_envio_provincias;
    obje.id_usuario = producto.id_usuario;
    if (usuario) {
      var productoEnBD = await validarExistenciaEnListaDeseos(
        usuario,
        producto._id
      );

      if (productoEnBD.existe) {
        obje.idListaDeseos = productoEnBD.id;
      } else {
        obje.idListaDeseos = null;
      }
    }

    arrayProducto.push(obje);
  }

  return arrayProducto;
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
      objetoRespuesta.ok = false;
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
    const producto = await Tienda.findById(_id);

    for (let index = 0; index < producto.fotos_producto.length; index++) {
      const element = producto.fotos_producto[index];

      console.log("- Eliminando imagenes asociadas al producto.");

      ///ELIMINADO IMAGEN DE LA BD //////
      var imagenElimadaBD = await eliminarImagenBDConId(element._id);
      if (!imagenElimadaBD.ok) return imagenElimadaBD;
      console.log(
        " | Imagen eliminada de la colección de imágenes. ",
        element._id
      );

      ///ELIMINADO IMAGEN DEL SERVIDOR //////
      var imagenElimadaServidor = eliminarImagenServidor(element.imagen_url);

      if (!imagenElimadaServidor) {
        objetoRespuesta.ok = false;
        objetoRespuesta.msg =
          "No se ha podido borrar la imagen del servidor, pero si de la base de datos de imagenes y desasociar del producto,.";
        return objetoRespuesta;
      }
      console.log(" | Imagen elimianda del servidor. ", element._id);
    }
    const productoBD = await Tienda.findByIdAndDelete(_id);
    if (productoBD == null) {
      objetoRespuesta.msg = "El id no cuenta con productos asociados.";
      return objetoRespuesta;
    }

    console.log("Producto eliminado ", productoBD._id);
    objetoRespuesta.msg =
      "Se ha borrado correctamente el producto " + productoBD._id;
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

const agregarAlCarrito = async (objeto) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    console.log("objeto agregar", objeto);

    var productoEnCarrito = await Carrito.findOne({
      producto: objeto.producto,
      usuario: objeto.usuario,
      id_tamanio: objeto.id_tamanio,
      color: objeto.color,
    });
    var carritoGuardado = null;
    if (!productoEnCarrito) {
      console.log("no repetido");
      var carrito = new Carrito(objeto);
      carritoGuardado = await carrito.save();
    } else {
      console.log("Repetido");
      productoEnCarrito.cantidad = productoEnCarrito.cantidad + objeto.cantidad;
      
      var totalProductos = await Tienda.findById(objeto.producto);

      totalProductos.tamanios.map(producto =>
        {
          if (producto._id == objeto.id_tamanio) {
            console.log("tamanios igiales");
            producto.colores.map(color =>
              {
                if(color._id == objeto.id_color ){

                  console.log("colores igiales");
                  if(color.cantidad < productoEnCarrito.cantidad){
            console.log("color.cantidad", color.cantidad);
            console.log("productoEnCarrito.cantidad",productoEnCarrito.cantidad );
                    
                    productoEnCarrito.cantidad= color.cantidad;
                    
                  }
                }
              });
            
          } 
        });
      
      carritoGuardado = await productoEnCarrito.save();
    



    }



    objetoRespuesta.msg =
      "Producto agregado correctamente al carrito. Id: " + carritoGuardado._id;
    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch agregarAlCarrito";
    return objetoRespuesta;
  }
};

const listarProductosCarritoUsuario = async (_id) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    productos: [],
    tipo_error: null,
  });

  try {
    const productoBD = await Carrito.find({ usuario: _id });
    if (productoBD.length == 0) {
      objetoRespuesta.ok = false;
      objetoRespuesta.msg =
        "El id no cuenta con productos asociados al carrito.";
      objetoRespuesta.tipo_error = "No existe producto";
      return objetoRespuesta;
    }

    objetoRespuesta.msg = "Se ha encontrado productos en carrito";
    objetoRespuesta.productos = productoBD;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de listarProductosCarritoUsuario | middelwares tienda"
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "" + error;
    objetoRespuesta.tipo_error = "Catch.";

    return objetoRespuesta;
  }
};

const eliminarProductoCarrito = async (_id) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  try {
    const productoBD = await Carrito.findByIdAndDelete(_id);
    if (productoBD == null) {
      objetoRespuesta.msg =
        "El id no cuenta con productos asociados ac carrito de compras.";
      return objetoRespuesta;
    }

    console.log("Producto eliminado de carrito. ", productoBD._id);
    objetoRespuesta.msg =
      "Se ha borrado correctamente el producto " +
      productoBD._id +
      " del carrito de compras.";
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de eliminarProductoCarrito | middelwares tienda"
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "" + error;
    objetoRespuesta.tipo_error = "Catch.";

    return objetoRespuesta;
  }
};

const cantidadProductosCarritoF = async(usuario) => {

  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      cantidadPCarrito: null,
      tipo_error: null,
    });

    var productosCarritoEnBD = await Carrito.find( { usuario } );
    
    objetoRespuesta.msg = "Consulta ejecutada correctamente.";
    objetoRespuesta.cantidadPCarrito = productosCarritoEnBD.length;
    
    return objetoRespuesta;
    


  } catch (error) {
    console.log("Error en catch cantidadProductosCarrito "+error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = ""+error;
    objetoRespuesta.msg = "Error en catch cantidadProductosCarrito ";

    return objetoRespuesta;
  }
}

module.exports = {
  crearNuevoProducto,
  listarProductosPorIdCliente,
  borarImagenProducto,
  listarTodosProductosBD,
  listarTodosProductosBDPorIdCategoria,
  eliminarProductoYAsociados,
  actuaizarProductoBD,
  listarProductosPorIdProducto,
  agregarAlCarrito,
  listarProductosCarritoUsuario,
  eliminarProductoCarrito,
  cantidadProductosCarritoF
};
