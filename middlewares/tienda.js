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
    console.log("Error en catch crearNuevoProducto | middlewares tienda", error);
    objeto.ok = false;
    (objeto.tipo_error = error), (objeto.msg = "Error al crear producto.");

    return objeto;
  }
};

module.exports = {
  crearNuevoProducto,
};
