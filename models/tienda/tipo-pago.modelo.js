const { Schema, model } = require("mongoose");
const tipo_pagoSchema = Schema(
  {
    nombre: {
      type: String,

      required: true,
      uniqued: true,
    },
  },
  { collection: "bdfc_tipos_pago" }
);

tipo_pagoSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("tipos_pago", tipo_pagoSchema);
