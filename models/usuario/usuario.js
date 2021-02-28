const { Schema, model } = require('mongoose');
const UsuarioSchema = Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    imagenP: {
        type: String
    },
    telefono: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    dir_linea1: {
        type: String
    },
    dir_linea2: {
        type: String
    },
    ciudad: {
        type: String
    },
    provincia: {
        type: String
    },
    pais: {
        type: String
    },
    codigopostal: {
        type: String
    },

    roleuser: {
        type: String,
        default: 'cliente'
    },
    estado: {
        type: Boolean,
        default: true
    }
}, { collection: 'bdfu_usuarios' });


UsuarioSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('Usuarios', UsuarioSchema);




