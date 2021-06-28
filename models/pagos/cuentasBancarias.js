const { Schema, model } = require("mongoose");
const cuentasBancarias = Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },

    nombre_cuenta: {
      type: String,
      required: true,
    },

    iban: {
      type: String,
    },

    numero_cuenta: {
      type: String,
      required: true,
    },
    bic_swift: {
      type: String,
    },

    titulo: {
      type: String,
    },

    banco: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
    },

    instrucciones: {
      type: String,
      required: true,
    },
  },
  { collection: "bdfc_cuentasBancarias", timestamps: true }
);

cuentasBancarias.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
cuentasBancarias.plugin(require("mongoose-autopopulate"));

module.exports = model("CuentasBancarias", cuentasBancarias);
