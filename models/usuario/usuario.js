const { Schema, model } = require("mongoose");
const UsuarioSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    apellidos: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    
    reputacion: {
      type: Number,
      required: true,
      default: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    tipo_catalogo: [{
      type: Schema.Types.ObjectId,
      ref: "TipoCatalogo",
      required: true,
      autopopulate: true,
    }],
    temas: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tema",
        autopopulate: true,
      },
    ],

    paises_coleccionados: [
      {
        type: Schema.Types.ObjectId,
        ref: "Pais",
        autopopulate: true,
      },
    ],
    imagenP: {
      type: String,
      required: true,
    },
    telefono: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    dir_linea1: {
      type: String,
    },
    dir_linea2: {
      type: String,
    },
    ciudad: {
      type: String,
    },
    provincia: {
      type: String,
    },
    pais_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Pais",
      required: true,
      autopopulate: true,
    },
    codigopostal: {
      type: String,
    },
    roleuser: {
      type: String,
      default: "cliente",
    },
    estado: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
      default: '',
    },
    
  },
  { collection: "bdfu_usuarios" }
);

UsuarioSchema.plugin(require("mongoose-autopopulate"));
UsuarioSchema.method("toJSON", function () {
  const { __v, _id, password, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Usuarios", UsuarioSchema);
