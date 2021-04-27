const { Schema, model } = require("mongoose");

const manco_listSchema = Schema(
  {
    name: {
        type: String,
        required: true,
        unique: true
    },
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
      autopopulate: true,
    },
    estado: {
      type: String,
      default: "public",
    },
  },
  { collection: "bdfc_manco_list_cat" }
);
manco_listSchema.plugin(require("mongoose-autopopulate"));

manco_listSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Manco_list_cat", manco_listSchema);
