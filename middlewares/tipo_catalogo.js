const { response } = require("express");

const Tipo_Catalogo = require("../models/catalogo/tipo_catalogo");

const buscarNombreTipoCatalogo = async (id) => {
  try {
    const tipoCatalgoBD = await Tipo_Catalogo.findOne({ _id: id });
    console.log("Tipo: ", tipoCatalgoBD);
    if (tipoCatalgoBD != null) {
      return tipoCatalgoBD.name;
    } else {
      return null;
    }
  } catch (e) {
    console.log("Error en catch buscarNombreTipoCatalogo");
    return null;
  }
};

const mostrarTipoCatalogos = async (req, res = response) => {
  try {
    var tiposCat = await Tipo_Catalogo.find();
    return res.json({
      ok: true,
      tipo_catalogos: tiposCat,
    });
  } catch (e) {
    return res.json({
      ok: false,
      msg: "No se ha podido consultar los tipos de catálogo.",
    });
  }
};

module.exports = {
  buscarNombreTipoCatalogo,
  mostrarTipoCatalogos,
};
