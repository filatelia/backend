const Datos_envio = require("../models/tienda/datos-envio.modelo");
const Ventas = require("../models/tienda/ventas.modelo");
const { listarProductosPorIdProducto } = require("./tienda");

async function crearDatosEnvio(objeto) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      id_datos_creados: null,
      tipo_error: null,
    });

    ////// Validar existencia de datos en Bd y editar /////

    var verificarEditar = await Datos_envio.findOneAndUpdate(
      { usuario: objeto.usuario },
      objeto
    );
    console.log("verificarEditar ", verificarEditar);
    if (verificarEditar) {
      objetoRespuesta.msg = "Datos modificados correctamente.";
      objetoRespuesta.id_datos_creados = verificarEditar._id;

      return objetoRespuesta;
    }

    /////// Creando Datos de envíos nuevos //////

    var objBD = new Datos_envio(objeto);

    const datosEnvioBD = await objBD.save();

    objetoRespuesta.msg = "Datos creados correctamente.";
    objetoRespuesta.id_datos_creados = datosEnvioBD._id;

    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch crearDatosEnvio" + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch crearDatosEnvio";

    return objetoRespuesta;
  }
}

async function mostrarDatosEnvioIdUsuario(usuario) {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    datos_envio: [],
    tipo_error: null,
  });

  try {
    const productoBD = await Datos_envio.findOne({ usuario });
    if (!productoBD) {
      objetoRespuesta.ok = true;
      objetoRespuesta.msg =
        "El id no cuenta con datos de envio asociados al carrito.";
      objetoRespuesta.tipo_error = "No se encuentran datos";
      return objetoRespuesta;
    }

    objetoRespuesta.msg = "Se ha encontrado datos de envío";
    objetoRespuesta.datos_envio = productoBD;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de mostrarDatosEnvioIdUsuario | middelwares ventas ",
      error
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.msg = "Descripción del error: " + error;
    objetoRespuesta.tipo_error =
      "Ha ocurrido un problema al consultar los datos de envío, ver descripción error.";

    return objetoRespuesta;
  }
}


async function crearNuevaVenta(objetoVenta) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      venta: null,
      tipo_error: null,
    });

    var objVentas = new Ventas(objetoVenta);
   var venta = await objVentas.save();

   objetoRespuesta.venta = venta;

    objetoRespuesta.msg = "Venta creada correctamente.";

    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch funciones -> crearNuevaVenta: " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "Descripción del error: " + error;
    objetoRespuesta.msg =
      "Error en función para crear la venta, ver tipo error: ";

    return objetoRespuesta;
  }
}

async function restarProductosVendidos(producto, idTamanio, idColor, cantidad) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    var productoBD = await listarProductosPorIdProducto(producto);

    for (let index = 0; index < productoBD.msg.tamanios.length; index++) {
      const tamanio = productoBD.msg.tamanios[index];

      if (tamanio._id == idTamanio) {
        for (let item = 0; item < tamanio.colores.length; item++) {

          const color = tamanio.colores[item];
        
          if (color._id == idColor) {
            color.cantidad = color.cantidad - cantidad;

            await productoBD.msg.save();
            objetoRespuesta.msg = "Venta realizada correctamente, se ha actualizado la cantidad de productos.";
            return objetoRespuesta;
          }
        }
      }
    }
  } catch (error) {
    console.log("Error en catch restarProductosVendidos " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch restarProductosVendidos ";
    return objetoRespuesta;
  }
}
module.exports = {
  crearDatosEnvio,
  mostrarDatosEnvioIdUsuario,

  crearNuevaVenta,
  restarProductosVendidos,
};
