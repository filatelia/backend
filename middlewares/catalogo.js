const { response } = require("express");
const Catalogo = require("../models/catalogo/catalogo");

const crearCatalogo = async (
  nombreCatalogo,
  id_solicitud,
  id_pais,
  id_tipo_catalogo,
  id_tema,
  estadoCat
) => {
  try {
    console.log("Entramos a catalogo");
    //Validando que nombre tema no exista
    var catalogoBD = await Catalogo.findOne({ name:nombreCatalogo });
    console.log("CATALogo bd", catalogoBD);
    if(catalogoBD != null){
      return null;
    }

    var nuevoCat = new Catalogo();
    nuevoCat.name = nombreCatalogo;
    nuevoCat.solicitud = id_solicitud;
    nuevoCat.tipo_catalogo = id_tipo_catalogo;
    nuevoCat.pais = id_pais;
    if(estadoCat){
      nuevoCat.estado= estadoCat;

    }
    nuevoCat.tema_catalogo = id_tema;

   var nuevoC= await nuevoCat.save();
   console.log("Nuevo c caralogo middel", nuevoC);
    return nuevoC;
  } catch (e) {
    console.log("Error al crear catálogo catch catalogo middlewears");
    return false;
  }
};
const eliminarCatalogo = async(id_catalogo) => {
  var eliminarCatalgo = await Catalogo.findByIdAndDelete(id_catalogo);
  return eliminarCatalgo;

}

module.exports = {
  crearCatalogo,
  eliminarCatalogo
};
