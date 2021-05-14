const { response } = require("express");
const Imagen = require("../models/catalogo/uploads");
//Funcion para validar la extensión de la imagen, solo se aceptan png, jpg y jpeg
const validarImg = async (req, res = response, next) => {
  try {
    console.log(req.files);

    const { sampleFile } = req.files;
    const nombreSeparado = sampleFile.name.split(".");
    const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];

    if (
      formatoArchivo.toLowerCase() === "webp" ||
      formatoArchivo.toLowerCase() === "png" ||
      formatoArchivo.toLowerCase() === "jpg" ||
      formatoArchivo.toLowerCase() === "jpeg"
    ) {
      console.log("formato permitido");
      next();
    } else {
      res.status(400).json({
        msg: "El formato " + formatoArchivo + " no está permitido.",
        formatos_Permitidos: "png | jpg | jpeg | webp",
      });
    }
  } catch (e) {
    console.log("Error", e);
    res.status(400).json({
      ok: false,
      msg: "Ha ocurrido un error, contacte al administrador",
    });
  }
};

const verificarRepetida = async (req, res = response, next) => {
  const { sampleFile } = req.files;
  if (sampleFile) {
    const nombreSeparado = sampleFile.name.split(".");
    try {
      const name = sampleFile.name;

      const existeImagen = await Imagen.findOne({ name });
      if (existeImagen) {
        console.log("imagen existente");
        return res.status(400).json({
          ok: false,
          msg: "El Imagen ya existe",
        });
      } else {
        console.log("imagen no existe", existeImagen);
        next();
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        ok: false,
        msg: "Error inesperado... revisar logs",
      });
    }
  }
};

module.exports = {
  validarImg,
  verificarRepetida,
};
