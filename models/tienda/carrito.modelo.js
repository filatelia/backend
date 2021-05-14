const { Schema, model } = require("mongoose");
const carritoSchema = Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    producto: {
      type: Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
      autopopulate: true,
    },
    id_tamanio: {
      type: String,
      required: true,
    },
    id_color: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
  },
  { collection: "bdfc_carrito" }
);

carritoSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
carritoSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("carrito", carritoSchema);
