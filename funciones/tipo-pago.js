const Tipo_pago = require("../models/tienda/tipo-pago.modelo");

const crearTipoPagoPredeterminados = async () => {
  console.log("- Verificandto tipos de pago en BD.");

  var tipoPagoBD = await Tipo_pago.find();
  if (tipoPagoBD.length == 0) {
    console.log(" | No existen tipos de pago en la Base de Datos.");
    console.log("  | Creando tipos de pago en la Base de Datos.");

    var nuevosTiposDePago = await Tipo_pago.insertMany([
      {
        nombre: "Transferencia Bancaria.",
        value: 0,
        estado: false
      },
      {
        nombre: "Paypal.",
        value: 1,
        estado: false
      },
    ]);

    console.log(
      "   | Se han creado " +
        nuevosTiposDePago.length +
        " tipos de pago predeterminados."
    );
  } else {
    console.log(" | Tipos de pago predeterminados en BD OK.");
  }
};

module.exports = {
  crearTipoPagoPredeterminados,
};
