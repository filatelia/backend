const { Schema, model } = require("mongoose");
const moneda_paypalSchema = Schema(
  {
    nombreMoneda: {
      type: String,
      required: true,

    },
    codigoMoneda: {
      type: String,
      required: true,
    },
  },
  { collection: "bdfc_moneda_paypal" }
);

moneda_paypalSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.uid = _id;
  return object;
});

module.exports = model(
  "moneda_paypal",
  moneda_paypalSchema
);
