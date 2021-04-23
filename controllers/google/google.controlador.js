const { response } = require("express");
const {
  accederGoogleSheetHojaUno,
} = require("../../credenciales_google_apis/conexion.google");
const path = require("path");
const fs = require("fs");
const { guardarImagenGoogleSeet } = require("../../middlewares/subir_imagen");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const googlePruebas = async (req, res = response) => {
  var estampilasss = await Estampillas.find({
    CATALOGO: "607e12f251f7fb33db4069ec",
  });
  await googleSeetFotoEstampilla("607e12f251f7fb33db4069ec", estampilasss);
};

const googleSeetFotoEstampilla = async (idCatalogo, arrayEstampillas) => {
  var idsImagenes = [];
  const hoja = await accederGoogleSheetHojaUno();
  for (let index = 0; index < arrayEstampillas.length; index++) {
    const element = arrayEstampillas[index].CODIGO;

    //Buscando id estampilla y id catalogo en documento
    for (let index = 0; index < hoja.length; index++) {
      const data = hoja[index];

      if (data["[ID_CATALOGO]"] == idCatalogo && data["[CODIGO]"] == element) {
        var idFoto = data["Imagen principal estampillas"].split("=")[1];
        var guardadass = await guardarImagenGoogleSeet(
          idFoto,
          element,
          "estampilla"
        );
        console.log("Estampillas Guardadas", guardadass);
      }

      idsImagenes.push(idFoto);
    }
  }
};

module.exports = {
  googlePruebas,
  googleSeetFotoEstampilla,
};
