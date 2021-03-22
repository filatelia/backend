const { Schema, model } = require("mongoose");
const SolicitudesSchema = Schema(
  {
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
    
    pais: {
      type: Schema.Types.ObjectId,
      ref: "Pais",
      required: true,
      autopopulate: true,
    },
    catalogo_nombre: {
     type: String
    },
    valor_catalogo: {
      type: String
     },

    observacion_rechazo: {
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
