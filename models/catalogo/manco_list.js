const { Schema, model } = require("mongoose");

const manco_listSchema = Schema(
  {

    // id_usuario: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Usuarios",
    //   required: true,
    //   autopopulate: true,
    // },
    id_mancolist_cat: {
      type: Schema.Types.ObjectId,
      ref: "Manco_list_cat",
      required: true,
      autopopulate: true,
    },
    id_estampilla: {
      type: Schema.Types.ObjectId,
      ref: "Estampillas",
      required: true,
      autopopulate: true,
    },
    estado_estampilla: {
      type: String,
      default: "Es indiferente",
    },
  },
  { collection: "bdfc_manco_list" }
);
manco_listSchema.plugin(require("mongoose-autopopulate"));

manco_listSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Manco_list", manco_listSchema);
