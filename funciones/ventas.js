const Datos_envio = require("../models/tienda/datos-envio.modelo");
const EstadosVenta = require("../models/tienda/estado-venta-modelo");
const Ventas = require("../models/tienda/ventas.modelo");

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

async function verificarCrearEstadosVenta() {
  console.log("- Verificando existencia de estados venta en BD.");

  var estadosVentaBD = await EstadosVenta.find();
  if (estadosVentaBD.length == 0) {
    console.log(" | No se han encontrado estados venta en BD.");

    var estadosBD = await EstadosVenta.insertMany([
      {
        nombre_estado: "Pago Rechazado",
        cod: 1,
        descripcion:
          "El vendor ha verificado el pago y ha concluido que el pago es procedente.",
      },
      {
        nombre_estado: "Pago Aceptado - Por Enviar",
        cod: 2,
        descripcion:
          "El pago ha sido verificado correctamente, el producto está en preparación para envío.",
      },
      {
        nombre_estado: "Pago Aceptado - Producto Enviado",
        cod: 3,
        descripcion:
          "El pago ha sido verificado correctamente, el producto va en camino.",
      },
      {
        nombre_estado: "Exitosa - Producto Entregado",
        cod: 4,
        descripcion:
          "La venta se ha concretado correctamente, el producto ya se encuentra en manos del comprador.",
      },
    ]);

    console.log(
      "   | Se han creado " + estadosBD.length + " estados venta en BD."
    );
  } else {
    console.log(" | Estados venta en BD. OK");
  }
}

async function crearNuevaVenta(objetoVenta) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    var objVentas = new Ventas(objetoVenta);
    await objVentas.save();

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
module.exports = {
  crearDatosEnvio,
  mostrarDatosEnvioIdUsuario,
  verificarCrearEstadosVenta,
  crearNuevaVenta,
};
