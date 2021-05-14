const Variantes = require("../models/catalogo/variantes-errores.modelo");
const Estampillas = require("../models/catalogo/estampillas.modelo");

const crearMuchasVariantesErrores = async (arrayVariantes) => {

    try {
    
        var variantesAgregadas = await Variantes.insertMany(arrayVariantes);
        return variantesAgregadas;
        
    } catch (error) {
        console.log("Error al guardar variantes y errores.", error);
        return null;
        
    }

}

const asociarVariantesErroresEstampilla = async (arrayVariantes)=>{


    try {
        
            for (let index = 0; index < arrayVariantes.length; index++) {
                const element = arrayVariantes[index];
                
                var estampillaBD = await Estampillas.findOne( { CODIGO: element.codigo_excel } );

                if(estampillaBD != null){
                console.log("element", element._id);
                estampillaBD.VARIANTES_ERRORES.push(element._id);
                    await estampillaBD.save();


                }
        
        
        
                
            }
        
            return true;
        
    } catch (error) {
        console.log("Error en catch asociarVariantesErroresEstampilla | middlewares variantes_errores.js", error);
        return false;
    }


}

module.exports = {
    crearMuchasVariantesErrores,
    asociarVariantesErroresEstampilla
}