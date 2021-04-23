const { response } = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const download = require("download");
const Imagenes = require("../models/catalogo/uploads");
const { asociarImagenEstampillaAEstampilla } = require("./estampillas");

const crearImagen = (req, ruta) => {
  const pathParaRetornar = new Object();
  pathParaRetornar.error = "";
  pathParaRetornar.url = "";

  try {
    const { sampleFile } = req.files;
    console.log("Sample File ->", sampleFile);

    //Asignando nombre único a la imagen:
    let now = new Date();
    let srtFecha = Date.parse(now);

    /**Se crea un nombre unico para la imagen, el cual es practicamente imposible que se repita
     * porque se maneja la fecha actual, con hora, minutos y segundos para hacer parte delnombre,
     * tambien se usa iid que genera un nombre casi imposible que se repita y sele adiciona
     * el nombre de la imagen antes de subirla, haciendo que sea practicamente imposible que exista un nombre igual
     */
    const nombreImagen = srtFecha + "_" + uuidv4() + "_" + sampleFile.name;
    console.log("Nombre único Imagen ->", nombreImagen);

    const uploadPath = path.join(
      __dirname,
      "../uploads/imagenes/" + ruta + "/" + nombreImagen
    );

    console.log("paht", uploadPath);
    sampleFile.mv(uploadPath, (err) => {
      console.log("errror->>>>", err);
      if (err) {
        console.log("No se ha podido guardar->", err);
        pathParaRetornar.error = err;
      } else {
        console.log("Guardada correctamente");
        pathParaRetornar.url = "/imagenes/" + ruta + "/" + nombreImagen;
      }
    });

    pathParaRetornar.url = "/imagenes/" + ruta + "/" + nombreImagen;

    return pathParaRetornar;
  } catch (e) {
    console.error("error en catch ->", e);
    pathParaRetornar.error =
      "Error inesperado en actualizar usuario -> subir_imagen() - cath, comuniquese con el administrador";
    return pathParaRetornar;
  }
};

const eliminarImagenServidor = (urlImgBD) => {
  const pahtImgServer = path.join(__dirname, "../uploads", urlImgBD);

  console.log("Eliminando imagen servidor", pahtImgServer);
  if (fs.existsSync(pahtImgServer)) {
    fs.unlinkSync(pahtImgServer);
    console.log("Imagen eliminada");
  }
};

const guardarImagenGoogleSeet = async (
  idImagen,
  codigoEstampilla,
  tipoImagen
) => {
  var objetoRespuesta = new Object({
    ok: false,
    msg: "Error al crear guardar Imagen desde GoogleSeet.",
    origenError: null,
    urlImagenGuardadaEnBD: "",
    IDImagenGuardadaEnBD: "",
  });

  try {
    console.log("Entramos guardarImagenGoogleSeet");
    //////////////////////GUARDANDO IMAGEN EN SERVIDOR///////////////////////////
    //Guardando imagen en el directorio del servidor
    var crearImagenDirectorioDir = await crearImagenDirectorio(
      tipoImagen,
      idImagen
    );

    //Verficando que el proceso anterior sea satisfractorio
    if (crearImagenDirectorioDir.ok != true) {
      objetoRespuesta.origenError = crearImagenDirectorioDir;
      return objetoRespuesta;
    }
    console.log("95 ->", crearImagenDirectorioDir);

    /////////////////////////// ASOCIANDO IMAGEN A ESTAMPILLA ////////////////////

    if (tipoImagen == "estampilla") {
      //Creando objeto a enviar para crear imagen
      var imagen = new Object({
        imagen_url: crearImagenDirectorioDir.urlImagenBD,
        tipo_imagen: tipoImagen,
        codigo_estampilla: codigoEstampilla,
        name: crearImagenDirectorioDir.nombreImagen,
      });

      /////////////////////////////GUARDANDO DATOS IMAGEN EN BD//////////////////////////

      //Guardando información de la imagen guardada en el servidor, en la base de datos.
      var guardarImagenBD = await guadarImagenEnBD(imagen);

      //Validar que el proceso de guardar informacion de la imagen sea satisfactorio
      if (guardarImagenBD.ok != true) {
        objetoRespuesta.origenError = guardarImagenBD;
        return objetoRespuesta;
      }
      console.log("Preparando para asociar");
      var asociarImagenAEstampilla = await asociarImagenEstampillaAEstampilla(
        codigoEstampilla,
        guardarImagenBD.idImagenBD
      );

      if (asociarImagenAEstampilla.ok != true) {
        objetoRespuesta.origenError = asociarImagenAEstampilla;
        return objetoRespuesta;
      }
      ////////////////////////DANDO RESPUESTA A PROCESO SATISFACTORIO////////////////////

      //Al llegar aquí, significa que todo salio bien, por ende se llena el objeto de respuesta y se envía
      objetoRespuesta.urlImagenGuardadaEnBD =
        crearImagenDirectorioDir.urlImagenBD;
      objetoRespuesta.IDImagenGuardadaEnBD = guardarImagenBD.idImagenBD;
      objetoRespuesta.msg =
        "Se ha guardado y asociado la estampilla correctamente";
      objetoRespuesta.ok = true;

      return objetoRespuesta;
    }
  } catch (error) {
    console.log(
      "error en catch de guardarImagenGoogleSeet | middlewares subir_imagen ->",
      error
    );
    objetoRespuesta.origenError = "catch";
    return objetoRespuesta;
  }
};
async function crearImagenDirectorio(tipoImagen, idImagen) {
  var objetoRespuesta = new Object({
    ok: false,
    msg: "Error al crear imagen en directorio",
    urlImagenBD: "",
    idImagenBD: "",
    nombreImagen: "",
    catch: false,
  });
  var urlImagenServidor = "";
  var urlImagenBD = "";
  try {
    if (tipoImagen == "estampilla") {
      urlImagenServidor = path.join(
        __dirname,
        "../uploads/imagenes/catalogo/estampillas/"
      );
      urlImagenBD = "imagenes/catalogo/estampillas/";
    } else {
      if (tipoImagen == "variante_error") {
        urlImagenServidor = path.join(
          __dirname,
          "../uploads/imagenes/catalogo/variantes-errores/"
        );
        urlImagenBD = "imagenes/catalogo/variantes-errores/";
      } else {
        console.log("tipoImagen -> ", tipoImagen);
        objetoRespuesta.msg = "Tipo de imagen no aceptado.";
        return objetoRespuesta;
      }
    }
    var nombreImagen = uuidv4();
    urlImagenBD = urlImagenBD + nombreImagen + ".png";

    //descargando y guardado imagen en directorio servidor
    fs.writeFileSync(
      path.join(urlImagenServidor, nombreImagen + ".png"),
      await download(
        "https://drive.google.com/uc?export=download&id=" + idImagen
      )
    );

    objetoRespuesta.urlImagenBD = urlImagenBD;
    objetoRespuesta.nombreImagen = nombreImagen;
    objetoRespuesta.ok = true;
    return objetoRespuesta;
  } catch (error) {
    console.log(
      "Error en catch de crearImagenDirectorio | middleweares -> subir_imagen.js ->",
      error
    );
    objetoRespuesta.catch = true;
    return objetoRespuesta;
  }
}

async function guadarImagenEnBD(imagen) {
  try {
    var objetoRespuesta = new Object({
      ok: false,
      msg: "Error al guardar la imagen en BD",
      catch: false,
      idImagenBD: "",
    });

    const guardarImagenBD = new Imagenes(imagen);
    var guarda = await guardarImagenBD.save();

    objetoRespuesta.ok = true;
    objetoRespuesta.msg = "Se ha guardado correctamente";
    objetoRespuesta.idImagenBD = guarda._id;
    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch guadarImagenEnBD | middlewares", error);
    objetoRespuesta.catch = true;
    objetoRespuesta.descipcionError = error;
    return objetoRespuesta;
  }
}
module.exports = {
  crearImagen,
  eliminarImagenServidor,
  guardarImagenGoogleSeet,
  guadarImagenEnBD,
  crearImagenDirectorio,
};
