const Estampillas = require("../models/catalogo/estampillas.modelo");

const eliminarEstampillasConIdCatalogo = async (id_catalogo) => {
  var eliminandoEstampillas = await Estampillas.deleteMany({
    Catalogo: id_catalogo,
  });
  return eliminandoEstampillas;
};
async function actualizarImagenEstampillaConCodigo(CODIGO, idImagenBD) {
  var estampillaBD = await Estampillas.findOne({CODIGO});

  estampillaBD.FOTO_ESTAMPILLAS = idImagenBD;
  estampillaBD.save();

  return estampillaBD;

  
}
async function asociarImagenEstampillaAEstampilla(CODIGO, idImagen) {

  try {
    
      var objetoRespuesta = new Object(
        {
          ok: false,
          msg: "",
          catch: false,
        })
      
      var estampillaBD = await Estampillas.findOne({CODIGO});
      estampillaBD.FOTO_ESTAMPILLAS = idImagen;
      
      await estampillaBD.save();
    
      objetoRespuesta.ok = true;
    
      return objetoRespuesta;
    
  } catch (error) {
    objetoRespuesta.msg = "Error desde el catch | asociar imagen a estampilla";
    objetoRespuesta.catch= true;
    
    return objetoRespuesta;
    
  }


  

}
async function eliminarEstampillaPorCodigo(CODIGO) {
  var eliminandoEstampillas = await Estampillas.deleteOne({
    CODIGO
  });
  return eliminandoEstampillas;

}
module.exports = {
  eliminarEstampillasConIdCatalogo,
  actualizarImagenEstampillaConCodigo,
  asociarImagenEstampillaAEstampilla,
  eliminarEstampillaPorCodigo
  
};
