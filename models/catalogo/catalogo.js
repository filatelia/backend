const { Schema, model } = require("mongoose");
const CatalogoSchema = Schema(
  {
    name: {
      type: String,
      default: "No asignado",
    },
    solicitud: {
      type: Schema.Types.ObjectId,
      ref: "Solicitudes",
      required: true,
      autopopulate: true
    },
    pais: {
      type: Schema.Types.ObjectId,
      ref: "Pais",
      required: true,
      autopopulate: true,
    },
    valor_catalogo: {
      type: String,
      default: "No asignado",
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
