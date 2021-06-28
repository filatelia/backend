const { Schema, model } = require("mongoose");
const ventasSchema = Schema(
  {
    comprador: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },

    datos_envio: {
      type: Schema.Types.ObjectId,
      ref: "datos_envio",
      required: true,
      autopopulate: true,
    },
    tipo_pago:{
      type:Number,
      required: true,

    },
    
    estado_venta:{
      type:Number,
      required: true,
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

        valor_producto_individual: {
          type: Number,
          required: true,
        },

        valor_total_productos: {
          type: Number,
          required: true,
        },

        tipo_envio: {
          type: String,
          required: true,
        },

        valor_envio: {
          type: Number,
          required: true,
        },

        valor_total: {
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
