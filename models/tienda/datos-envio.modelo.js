const { Schema, model } = require("mongoose");
const datos_envioSchema = Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
    },

    telefono: {
      type: String,
      required: true,
    },

    direccion_completa: {
      type: String,
      required: true,
    },

    otras_indicaciones: {
      type: String,
      required: true,
    },

    departamento: {
      type: String,
    },
    provincia: {
      type: String,
    },

    distrito: {
      type: String,
    },


  },
  {
    collection: "bdfc_datos_envio",
  }
);

datos_envioSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;

  return object;
});

module.exports = model("datos_envio", datos_envioSchema);
