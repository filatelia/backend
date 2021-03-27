const { Schema, model } = require("mongoose");
const TipoCatalogoSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    }


  },
  { collection: "bdfu_TipoCatalogo" }
);

TipoCatalogoSchema.plugin(require("mongoose-autopopulate"));
TipoCatalogoSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("TipoCatalogo", TipoCatalogoSchema);
