const { Schema, model } = require("mongoose");
const tipoEstadoSolicitudSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    abreviacion: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
    },
  },
  { collection: "bdfc_tipoEstadoSolicitud" }
);

tipoEstadoSolicitudSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
tipoEstadoSolicitudSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("tipoEstadoSolicitud", tipoEstadoSolicitudSchema);
