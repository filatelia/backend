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

const googleSeetFotoEstampilla = async (arrayEstampillas) => {
  var arrayAgreagar = [];
  var arrayEliminar = [];
  console.log("Llegamos a googleSeetFotoEstampilla");

  const hoja = await accederGoogleSheetHojaUno();

  var conImagenrr = [];
  console.log("arrayEstampillas", arrayEstampillas);
  
  //////////SEPARANDO LAS IMAGENES DEL CATALOGO SOLICITADO ////////////
  arrayEstampillas.map((data) => {
    conImagenrr = hoja.find((dat) => dat["[CODIGO]"] == data.CODIGO);
    var objeto = new Object();
    console.log("conImagenrr",conImagenrr);
    if (conImagenrr) {
      objeto.idFoto = conImagenrr["Imagen principal estampillas"].split("=")[1];
      objeto.codigo = data.CODIGO;
      arrayAgreagar.push(objeto);
    } else {
      arrayEliminar.push(data.CODIGO);
    }
  });

  console.log("array agregar", arrayAgreagar);
  for (let index = 0; index < arrayAgreagar.length; index++) {
    const element = arrayAgreagar[index];
    console.log("element" , element);
    var guardadass = await guardarImagenGoogleSeet(element.idFoto, element.codigo, "estampilla");
   console.log("Estampillas Guardadas", guardadass);
  }
  


};

module.exports = {
  googlePruebas,
  googleSeetFotoEstampilla,
};
