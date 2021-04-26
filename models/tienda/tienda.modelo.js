const { Schema, model } = require("mongoose");
const productoSchema = Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    nombre_producto: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
    },
    categoria: {
      type: Schema.Types.ObjectId,
      ref: "Categoria",
      required: true,
      autopopulate: true,
    },
    precio_normal: {
      type: Number,
      required: true,
    },
    precio_descuento: {
      type: Number,
    },
    fotos_producto: [
      {
        type: Schema.Types.ObjectId,
        ref: "uploads_imagen",
        required: true,
        autopopulate: true,
      },
    ],
    cantidad_productos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cantidad_producto_color",
        required: true,
        autopopulate: true,
      },
    ],
    tarifa_envio: {
      type: String,
      required: true,
    },
    moneda_producto: {
      type: String,
      required: true,
    },
    tamanios: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { collection: "bdfc_productos" }
);

productoSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
productoSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("Producto", productoSchema);
