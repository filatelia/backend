const { Schema, model } = require("mongoose");
const cuentaPaypal = Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
    },

    client: {
      type: String,
      required: true,
    },

    secret: {
      type: String,
    },

   
  },
  { collection: "bdfc_cuentaPaypal", timestamps: true }
);

cuentaPaypal.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model("cuentaPaypal", cuentaPaypal);
