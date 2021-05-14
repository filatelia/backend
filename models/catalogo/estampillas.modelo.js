const { Schema, model } = require("mongoose");
const EstampillasSchema = Schema({
    CATALOGO: {
        type: Schema.Types.ObjectId,
        ref: "Catalogo",
        required: true,
        autopopulate: true,
    },

    FOTO_ESTAMPILLAS: {
        type: Schema.Types.ObjectId,
        ref: "uploads_imagen",
        autopopulate: true,
    },

    CODIGO: {
        type: String,
        required: true,
    },
    DESCRIPCION_ESTAMPILLA: {
        type: String,
    },

    ANIO: {
        type: String,
        required: true,
    },
    CATEGORIA: {
        type: String,
        required: true,
    },

    GRUPO: {
        type: String,
    },

    NRO_ESTAMPILLAS: {
        type: String,
    },

    TITULO_DE_LA_SERIE: {
        type: String,
        required: true,
    },

    NUMERO_DE_CATALOGO: {
        type: String,
    },
    VALOR_FACIAL: {
        type: String,
        required: true,
    },

    TIPO_MONEDA_VALOR_FACIAL: {
        type: String,
        required: true,
    },
    VALOR_CATALOGO_NUEVO: {
        type: String,
    },

    VALOR_DEL_CATALOGO_USADO: {
        type: String,
    },
    MONEDA_VALOR_CATALOGO_NUEVO_USADO: {
        type: String,
    },
    TIPO: {
        type: String,
        required: true,
    },
    VARIANTES_ERRORES: [{
        type: Schema.Types.ObjectId,
        ref: "Variantes_errores",
        autopopulate: true,
    }],

}, { collection: "bdfc_estampillas" });

EstampillasSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
});
EstampillasSchema.plugin(require("mongoose-autopopulate"));

module.exports = model("Estampillas", EstampillasSchema);