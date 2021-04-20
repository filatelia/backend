const { Schema, model } = require("mongoose");
const TipoEsperadoEstampillaSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    }


  },
  { collection: "bdfu_TipoEsperadoEstampillaDeMancolista" }
);

TipoEsperadoEstampillaSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("TipoEsperadoEstampillaDeMancolista", TipoEsperadoEstampillaSchema);
