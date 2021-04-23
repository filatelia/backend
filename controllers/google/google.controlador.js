const { response } = require("express");
const {
  accederGoogleSheetHojaUno, accederGoogleSheetHojaVariantes
} = require("../../credenciales_google_apis/conexion.google");
const path = require("path");
const fs = require("fs");
const { guardarImagenGoogleSeet } = require("../../middlewares/subir_imagen");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const { eliminarEstampillaPorCodigo } = require("../../middlewares/estampillas");
const googlePruebas = async (req, res = response) => {
  var estampilasss = await Estampillas.find({
    CATALOGO: "607e12f251f7fb33db4069ec",
  });
  await googleSehetFotoEstampilla("607e12f251f7fb33db4069ec", estampilasss);
};

const googleSheetFotoEstampilla = async (arrayEstampillas) => {
  var arrayAgreagar = [];
  var arrayEliminar = [];
  console.log("Llegamos a googleSeetFotoEstampilla");

  const hoja = await accederGoogleSheetHojaFotoEstampillas();

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
      objeto.codigo = data.CODIGO;
      arrayEliminar.push(objeto);

    }
  });

  console.log("array agregar", arrayAgreagar);

  /////ELIMINANDO ESTAMPILLAS SIN FOTO PRINCIPAL ///

  for (let index = 0; index < arrayEliminar.length; index++) {
    const element = arrayEliminar[index];

    var eliminarEstampilla = await eliminarEstampillaPorCodigo(element.codigo);
    console.log("Estampilla sin imagen eliminada", eliminarEstampilla.deletedCount);
    
  }

  ///// GUAARDANDO IMAGENES EN EL SERVIDOR, BD Y ASOCIANDOLAS////
  for (let index = 0; index < arrayAgreagar.length; index++) {
    const element = arrayAgreagar[index];
    console.log("element" , element);
    var guardadass = await guardarImagenGoogleSeet(element.idFoto, element.codigo, "estampilla");
   console.log("Estampillas Guardadas", guardadass);
  }
  


};

const googleSheetVariantesErrores = async (arrayEstampillas) => {
  const hoja = await accederGoogleSheetHojaVariantes();
  console.log(hoja);


}


module.exports = {
  googlePruebas,
  googleSheetFotoEstampilla,
  googleSheetVariantesErrores
};
