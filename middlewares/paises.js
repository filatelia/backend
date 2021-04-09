const fs = require("fs");
const Path = require("path");
const axios = require("axios");
const Paises = require("../models/catalogo/paises");

const crearPaisesAutom = async (upaises) => {
  try {
    console.log("Creando paises ...");

    for (let index = 0; index < upaises.length; index++) {
      const element = upaises[index];

      element.para_buscar = element.name.toLowerCase().replace(/\s+/g, "");

      const paisNuevo = new Paises(element);
      await paisNuevo.save();
    }

    var obj = new Object();
    obj.status = 200;
    obj.total = upaises.length;
    return obj;
  } catch (e) {
    return e;
  }
};

const buscarPaisPorNombre = async (nombrePais) => {
  try {
    var name = nombrePais.toLowerCase().replace(/\s+/g, "");
    const paisEncontrado = await Paises.findOne({ para_buscar: name });
    return paisEncontrado;
  } catch (e) {
    return false;
  }
};


module.exports = {
  crearPaisesAutom,
  buscarPaisPorNombre
};
