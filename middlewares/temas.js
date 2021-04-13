const Temas = require("../models/catalogo/temas");

const crearNuevoTema = async (nombreTema) => {
  try {
    var ParaBuscar = nombreTema.toLowerCase().replace(/\s+/g, "");
    var objTema = new Temas();
    objTema.name = nombreTema;
    objTema.ParaBuscar = ParaBuscar;

    var nuevoTema = await objTema.save();
    console.log("Nuevo tema ->", nuevoTema);
    return nuevoTema;
  } catch (e) {
    console.log("Error al crear el tema desde cath", e);
    return null;
  }
};
const buscarTema = async (nombreTema) => {
  var ParaBuscar = nombreTema.toLowerCase().replace(/\s+/g, "");
  const temaBD = await Temas.findOne({ ParaBuscar });
  return temaBD;
};

module.exports = {
  crearNuevoTema,
  buscarTema,
};
