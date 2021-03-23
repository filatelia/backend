const { Schema, model } = require('mongoose');
const EstampillasSchema = Schema({

catalogo: {
    type : Schema.Types.ObjectId,
    ref: 'Catalogo',
    autopopulate: true
},
    Descripcion: {
        type: String,
        required: true
    },
    Codigo: {
        type: String,
        required: false
    },
    Tipo: {
        type: String,
        required: true
    }, 
    ParaBuscar: {
        type: String,
        required: true
    },
    
 
    Pais: {
        type : Schema.Types.ObjectId,
        ref: 'Pais',
        required : true,
        autopopulate: true
    },
        
    Tema: {
        type : Schema.Types.ObjectId,
        ref: 'Tema',
        required : true,
        autopopulate: true
    },
    Anio: {
        type: Number,
        required: true
    },
    Grupo: {
        type: Number,
        required: true
    },
    Foto_JPG_800x800_px: {
        type: String,
        required: true
    },
    Nro_Estampillas: {
        type: Number,
        required: true
    },
    Descripcion_de_la_serie: {
        type: String,
        required: true
    },
    Valor_Facial: {
        type: String,
        required: false
    },
    Numero_de_catalogo: {
        type: String,
        required: false
    },
    Valor_del_Catalogo: {
        type: String,
        required: false
    },

    estado: {
        type: Boolean,
        default: true
    }
}, { collection: 'bdfc_estampillas' })


EstampillasSchema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
EstampillasSchema.plugin(require('mongoose-autopopulate'));

module.exports = model('Estampillas', EstampillasSchema);