const EstadosVenta = require("../models/tienda/estado-venta-modelo");

async function verificarCrearEstadosVenta() {
  console.log("- Verificando existencia de estados venta en BD.");

  var estadosVentaBD = await EstadosVenta.find();
  if (estadosVentaBD.length == 0) {
    console.log(" | No se han encontrado estados venta en BD.");

    var estadosBD = await EstadosVenta.insertMany([
      {
        nombre_estado: "En espera de Pago",
        value: 0,
        descripcion:
          "La venta se ha registrado correctamente y su pago está pendiente.",
      },
      {
        nombre_estado: "Comprobante de pago en Revisión",
        value: 1,
        descripcion:
          "Comprador ha enviado un comprobante de pago.",
      },
      {
        nombre_estado: "Pago Rechazado",
        value: 2,
        descripcion:
          "El vendor ha verificado el pago y ha concluido que el pago es improcedente.",
      },
      {
        nombre_estado: "Pago Aceptado - Por Enviar",
        value: 3,
        descripcion:
          "El pago ha sido verificado correctamente, el producto está en preparación para envío.",
      },
      {
        nombre_estado: "Pago Aceptado - Producto Enviado",
        value: 4,
        descripcion:
          "El pago ha sido verificado correctamente, el producto va en camino.",
      },
      {
        nombre_estado: "Exitosa - Producto Entregado",
        value: 5,
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

module.exports = {
  verificarCrearEstadosVenta,
};
