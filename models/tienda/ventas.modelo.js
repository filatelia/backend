const { Schema, model } = require("mongoose");
const ventasSchema = Schema(
  {
    comprador: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    vendedor: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    productos: [
      {
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
    ],
  },
  { collection: "bdfc_ventas" }
);

ventasSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
ventasSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("ventas", ventasSchema);
