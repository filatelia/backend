const { Schema, model } = require("mongoose");
const cantidad_producto_colorSchema = Schema(
  {
    color_hex: {
      type: String,
    },
    cantidad: {
      type: Number,
      required: true,
    },
  },
  { collection: "bdfc_cantidad_producto_color" }
);

cantidad_producto_colorSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model(
  "Cantidad_producto_color",
  cantidad_producto_colorSchema
);
