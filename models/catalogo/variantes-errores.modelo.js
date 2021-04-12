const { Schema, model } = require('mongoose');
const Variantes_errores_Schema = Schema({

    Descripcion: {
        type: String,
        required: true
    },
    Imagen_variantes_errores: {
        type: String,
    },

    
   
}, { collection: 'bdfc_variantes_errores' })


Variantes_errores_Schema.method('toJSON', function () {
    const { __v, _id, ...object } = this.toObject();
    object.uid = _id;
    return object;
})
Variantes_errores_Schema.plugin(require('mongoose-autopopulate'));

module.exports = model('Variantes_errores', Variantes_errores_Schema);