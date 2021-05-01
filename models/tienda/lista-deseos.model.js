const { Schema, model } = require("mongoose");
const lista_deseosSchema = Schema(
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
    
  },
  { collection: "bdfc_lista_deseos" }
);

lista_deseosSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
lista_deseosSchema.plugin(require("mongoose-autopopulate"));


module.exports = model(
  "lista_deseos",
  lista_deseosSchema
);
