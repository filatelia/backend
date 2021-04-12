const { response } = require('express');
const { validationResult } = require('express-validator');

const validarCampos = (req, res = response, next ) => {

    const errores = validationResult( req );

    if ( !errores.isEmpty() ) {
        return res.status(400).json({
            ok: false,
            errors: errores.mapped()
        });
    }

    next();
}
const validarDatosRecibidosCrearEstampilla = async (req, res, next) =>{

    const { 
        id_solicitud, 
        descripcion,
        codigo,
        tipo,
        pais,
        tema,
        anio,
        grupo,
        nro_Estampillas,
        descripcion_de_la_serie,
        valor_Facial,
        numero_de_catalogo,
        valor_del_Catalogo,
        varientes_errores

    
    } = req.body;

next();
}
module.exports = {
    validarCampos,
    validarDatosRecibidosCrearEstampilla
}
