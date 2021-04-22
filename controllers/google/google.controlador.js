const { response } = require("express")
const { accederGoogleSheetHojaUno } = require("../../credenciales_google_apis/conexion.google");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const imageDownloader = require('../../credenciales_google_apis/imagenes.google').download;



const googlePruebas = async (req, res = response) => {

// Importamos la función para descargar imágenes

// URL de la imagen que queremos descargar
const imageUrl = 'https://drive.google.com/file/d/1eQooEbZFlE1LvduGZti4M8ciEFNV_zoL/view?usp=sharing';

// Fichero de salida con el directorio al que vamos a guardar
const filename = 'images/'.concat('regular-expresion.jpg');

// Función para descargar las imágenes
imageDownloader(imageUrl, filename, function(){
    console.log(`${imageUrl} image download!!`);
});
    const hoja = await accederGoogleSheetHojaUno();
    console.log("Hoja", hoja);

       
}



module.exports = {
    googlePruebas,
}