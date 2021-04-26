const { Schema, model } = require("mongoose");
const categoriaSchema = Schema(
  {
    nombre_categoria: {
      type: String,
    },
  },
  { collection: "bdfc_categorias" }
);

categoriaSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("Categoria", categoriaSchema);
