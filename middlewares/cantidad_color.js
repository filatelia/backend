const CantidadColor = require("../models/tienda/cantidad-productos.model");

const crearCantidadColor = async (objetoCantidadColor) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    ///////CREANDO ELEMENTO CUANDO EL ARRAY SÓLO TRAE UNO////////
    if (objetoCantidadColor.length == 1) {
      var objGuardado = new CantidadColor(objetoCantidadColor[0]);
      var guardado = await objGuardado.save();
      objetoRespuesta.msg = [guardado];

      return objetoRespuesta;
    } else {
      ///////CREANDO ELEMENTO CUANDO EL ARRAY ES MÚLTIPLE////////

      var guardado = await CantidadColor.insertMany(objetoCantidadColor);
      objetoRespuesta.msg = guardado;

      return objetoRespuesta;
    }
  } catch (error) {
    console.log(
      "Error al crear cantidad color desde cath |crearCantidadColor middlewares cantidad_color",
      error
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "Error en Catch crearCantidadColor.";
    objetoRespuesta.tipo_error = error;

    return objetoRespuesta;
  }
};



module.exports = {
    crearCantidadColor,

};
