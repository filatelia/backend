const { Schema, model } = require("mongoose");
const estados_ventaSchema = Schema(
  {
    nombre_estado: {
      type: String,
      required: true,
      unique: true

    },
    value: {
        type: Number,
        required: true,
        unique: true
      },
    descripcion: {
      type: String,
    },
  },
  { collection: "bdfc_estados_venta" }
);

estados_ventaSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
estados_ventaSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("estados_venta", estados_ventaSchema);
