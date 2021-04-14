const { Schema, model } = require("mongoose");
const reportesSchema = Schema(
  {

    usuario_reportado: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    usuario_reportante: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    tipo_estado_reporte: {
      type: Schema.Types.ObjectId,
      ref: "TipoEstadoReporte",
      required: true,
      autopopulate: true,
    },
    descripcion_reporte_cliente: {
      type: String,
      required: true
    },
    mensaje_administrador_a_reportante: [
      {
        type: String,
      },
      {
        timestamps: true,
      },
    ],
    mensaje_administrador_a_reportado: [
      {
        type: String,
      },
      {
        timestamps: true,
      },
    ],

  },
  { collection: "bdfc_Reportes", timestamps: true }
);

reportesSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});
reportesSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("Reportes", reportesSchema);
