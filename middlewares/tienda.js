const Tienda = require("../models/tienda/tienda.modelo");

const crearNuevoProducto = async (objetoProducto) => {
  var objeto = new Object({
    ok: true,
    tipo_error: null,
    msg: "Se ha creado correctamente el producto",
  });
  try {
    var objProducto = new Tienda(objetoProducto);
    await objProducto.save();

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

module.exports = {
  crearNuevoProducto,
  listarProductosPorIdCliente,
};
