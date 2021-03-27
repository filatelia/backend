const { Schema, model } = require('mongoose');

const TemasSchema = Schema({ 
    name : {
        type: String,
        require: true,
        unique: true
    },
    ParaBuscar: {
        type: String,
        required: true
    },
    imagen : {
        type:String,
    }
}, { collection: 'bdfc_temas' });

TemasSchema.method('toJSON', function() {
    const { __v, _id,  ...object } = this.toObject();
    object.uid = _id;
    return object;
});

module.exports = model('Tema', TemasSchema);