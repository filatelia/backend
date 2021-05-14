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

    fotos_producto: [
      {
        type: Schema.Types.ObjectId,
        ref: "uploads_imagen",
        required: true,
        autopopulate: true,
      },
    ],
    foto_principal: {
      type: Schema.Types.ObjectId,
      ref: "uploads_imagen",
      required: true,
      autopopulate: true,
    },

    tamanios: [
      {
        nombre_tamanio: {
          type: String,
          required: true,
        },
        precio: {
          type: Number,
          required: true,
        },
        precio_descuento: {
          type: Number,
        },
        colores: [
          {
            hex: {
              type: String,
            },
            nombre: {
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
    ],

    tarifa_envio_lima: {
      type: Number,
      required: true,
    },
    tarifa_envio_provincias: {
      type: Number,
      required: true,
    },
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
