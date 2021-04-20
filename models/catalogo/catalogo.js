const { Schema, model } = require("mongoose");
const CatalogoSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    solicitud: {
      type: Schema.Types.ObjectId,
      ref: "Solicitudes",
      required: true,
      autopopulate: true,
    },
    pais: {
      type: Schema.Types.ObjectId,
      ref: "Pais",
      autopopulate: true,
    },
    tipo_catalogo: {
      type: Schema.Types.ObjectId,
      ref: "TipoCatalogo",
      required: true,
      autopopulate: true,
    },
    tema_catalogo: {
      type: Schema.Types.ObjectId,
      ref: "Tema",
      autopopulate: true,
    },

    estado: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "bdfc_catalogo", timestamps: true }
);

CatalogoSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
CatalogoSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("Catalogo", CatalogoSchema);
