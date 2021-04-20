const { Schema, model } = require("mongoose");
const tipoEstadoReporteSchema = Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    abreviacion: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
      required: true,
    },
  },
  { collection: "bdfc_TipoEstadoReporte" }
);

tipoEstadoReporteSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
tipoEstadoReporteSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("TipoEstadoReporte", tipoEstadoReporteSchema);
