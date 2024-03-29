const { Schema, model } = require("mongoose");
const SolicitudesSchema = Schema(
  {
    catalogo_nombre_interno: {
      type: String,
      required: true,
    },
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    tipoEstadoSolicitud_id: {
      type: Schema.Types.ObjectId,
      ref: "tipoEstadoSolicitud",
      required: true,
      autopopulate: true,
    },

    tipo_catalogo: {
      type: Schema.Types.ObjectId,
      ref: "TipoCatalogo",
      required: true,
      autopopulate: true,
    },
    pais: {
      type: Schema.Types.ObjectId,
      ref: "Pais",
      autopopulate: true,
    },
    tema: {
      type: Schema.Types.ObjectId,
      ref: "Tema",
      autopopulate: true,
    },
    mensaje_rechazo: {
      type: String
    }
  },
  { collection: "bdfu_solicitudes", timestamps: true }
);

SolicitudesSchema.plugin(require("mongoose-autopopulate"));
SolicitudesSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Solicitudes", SolicitudesSchema);
