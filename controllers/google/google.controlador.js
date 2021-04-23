const { response } = require("express");
const {
  accederGoogleSheetHojaFotoEstampillas,
  accederGoogleSheetHojaVariantes,
} = require("../../credenciales_google_apis/conexion.google");
const path = require("path");
const fs = require("fs");
const {
  guardarImagenGoogleSeet,
  crearImagenDirectorio,
} = require("../../middlewares/subir_imagen");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const {
  eliminarEstampillaPorCodigo,
} = require("../../middlewares/estampillas");

const { crearMuchasVariantesErrores, asociarVariantesErroresEstampilla } = require("../../middlewares/variantes_errores")


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
    console.log("conImagenrr", conImagenrr);
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
    console.log(
      "Estampilla sin imagen eliminada",
      eliminarEstampilla.deletedCount
    );
  }

  ///// GUAARDANDO IMAGENES EN EL SERVIDOR, BD Y ASOCIANDOLAS////
  for (let index = 0; index < arrayAgreagar.length; index++) {
    const element = arrayAgreagar[index];
    console.log("element", element);
    var guardadass = await guardarImagenGoogleSeet(
      element.idFoto,
      element.codigo,
      "estampilla"
    );
    console.log("Estampillas Guardadas", guardadass);
  }
};

const googleSheetVariantesErrores = async (arrayEstampillas) => {
  const hoja = await accederGoogleSheetHojaVariantes();
  var arrayAgreagar = [];
  var arrayEliminar = [];
  //////////SEPARANDO LAS IMAGENES DEL CATALOGO SOLICITADO ////////////
  hoja.map((data) => {
    var objeto = new Object();
    var foto = "";

    arrayEstampillas.map((google) => {
      if (google.CODIGO == data["[CODIGO]"]) {
        objeto.codigo = data["[CODIGO]"];
        if ((objeto.idFoto = data["Fotos variante o error"])) {
          objeto.idFoto = data["Fotos variante o error"].split("=")[1];
        } else {
          objeto.idFoto = data["Fotos variante o error"];
        }
        objeto.descripcion = data["Variante o Error"];

        arrayAgreagar.push(objeto);
      }
    });
  });

  var variantes = [];

  //// GUARDANDO IMAGENES DE VARIANTES Y ERRORES EN EL SERVIDOR ////

  for (let index = 0; index < arrayAgreagar.length; index++) {
    var element = arrayAgreagar[index];
    var objeto = new Object();

    if (!element.idFoto) {
      element.idFoto = null;
    }

    var imagenDirectorio = await crearImagenDirectorio(
      "variante_error",
      element.idFoto
    );
    if (imagenDirectorio.ok != true) {
      console.log("imagenDirectorio", imagenDirectorio);

      return false;
    }
    objeto.codigo_excel= element.codigo;
    objeto.Descripcion= element.descripcion;
    objeto.Imagen_variantes_errores = imagenDirectorio.urlImagenBD;

    variantes.push(objeto);

  }

  ////////// GUARDANDO INFORMACION DE VARIANTES Y ERROES EN BD ////////
  var variantesGuardadas = await crearMuchasVariantesErrores(variantes);
  var variantesAsociadas= await asociarVariantesErroresEstampilla(variantesGuardadas);
  
  console.log("Variantes asociadas", variantesAsociadas);
  if (variantesAsociadas == true) {
    return true;
  } else {
    return false;
  }

};

module.exports = {
  googlePruebas,
  googleSheetFotoEstampilla,
  googleSheetVariantesErrores,
};
