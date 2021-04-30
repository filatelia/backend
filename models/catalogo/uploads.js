const { Schema, model } = require('mongoose');

const uploads_ImagenSchema = Schema({ 
    name : {
        type: String,
        require: true,
        unique: true
    },

    imagen_url : {
        type:String,
        require: true,
    },
    tipo_imagen : {
        type:String,
        require: true,
    },

    estampilla : {
        type:String,
    },
    codigo_estampilla : {
        type:String,
        unique: false
    },
    
    catalogo: {
        type: Schema.Types.ObjectId,
        ref: "Catalogo",
      },
}, { collection: 'bdfc_uploads_imagenes' });

uploads_ImagenSchema.method('toJSON', function() {
    const { __v, _id,  ...object } = this.toObject();
    object.uid = _id;
    return object;
});
uploads_ImagenSchema.plugin(require("mongoose-autopopulate"));

module.exports = model('uploads_imagen', uploads_ImagenSchema);