
const { response } = require("express");
const path = require("path");
const Imagenes = require("../../models/catalogo/uploads");

const { v4: uuidv4 } = require("uuid");

const getImages = async (req, res) => {
  const images = await imagenes.find();
  res.json({
    ok: true,
    images,
  });
};

const createImageCat = async (req, res = response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No hay un archivo seleccionado");
    return;
  }

  console.log("imagen: ", req.files);

  const { sampleFile } = req.files;

  const uploadPath = path.join(
    __dirname,
    "../../uploads/imagenes/catalogo/cat/" + sampleFile.name
  );

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      console.log("error:", err);
      return res.status(500).json({
        msg: err,
      });
    }
  });

  const imagen_url = "/uploads/imagenes/catalogo/cat/" + sampleFile.name;

  const nombreSeparado = sampleFile.name.split(".");
  const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
  //Guardando informacion de la imagen en la bd.
  req.body.name = sampleFile.name;
  req.body.name_buscar =
    nombreSeparado[0].toLowerCase().replace(/\s+/g, "") +
    "." +
    nombreSeparado[1].toLowerCase().replace(/\s+/g, "");
  req.body.imagen_url = imagen_url;
  const imagen_ = new Imagenes(req.body);
  // Guardar usuario
  const imagen_subida = await imagen_.save();
  console.log("imagen subida: ", imagen_subida);
  imagen_subida.imagen_url = path.join(
    __dirname,
    "../.." + imagen_subida.imagen_url
  );
  res.json({
    ok: true,
    imagen_subida,
  });
};

const createImageEstampilla = async (req, res = response) => {
  console.log("Imagen recibido ->", req.files);
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No hay un archivo seleccionado");
    return;
  }
  const { sampleFile } = req.files;

  var imagen_arr = [];

  for (let index = 0; index < sampleFile.length; index++) {
    const nombreSeparado = sampleFile[index].name.split(".");
    const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
    console.log("imagen: ", req.files);
    var nombreImagen = uuidv4() + "." + formatoArchivo;

    const uploadPath = path.join(
      __dirname,
      "../../uploads/imagenes/catalogo/estampillas/" + nombreImagen
    );
    sampleFile[index].mv(uploadPath, (err) => {
      if (err) {
        console.log("error:", err);
        return res.status(500).json({
          msg: err,
        });
      }
    });

    const imagen_url = "/imagenes/catalogo/estampillas/" + nombreImagen;

    //Guardando informacion de la imagen en la bd.
    req.body.name = nombreImagen;
    req.body.imagen_url = imagen_url;
    req.body.catalogo = req.body.catalogo;
    req.body.codigo_estampilla = uuidv4();
    req.body.tipo_imagen = "estampilla";
    const imagen_ = new Imagenes(req.body);
    // Guardar usuario
    const imagen_subida = await imagen_.save();
    imagen_arr.push(imagen_subida);
  }
  res.json({
    ok: true,
    imagen_arr,
  });
};

const createImageTema = async (req, res = response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("No hay un archivo seleccionado");
    return;
  }

  console.log("imagen: ", req.files);

  const { sampleFile } = req.files;

  const uploadPath = path.join(
    __dirname,
    "../../uploads/imagenes/catalogo/tema/" + sampleFile.name
  );

  sampleFile.mv(uploadPath, (err) => {
    if (err) {
      console.log("error:", err);
      return res.status(500).json({
        msg: err,
      });
    }
  });

  const imagen_url = "/uploads/imagenes/catalogo/tema/" + sampleFile.name;

  const nombreSeparado = sampleFile.name.split(".");
  const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
  //Guardando informacion de la imagen en la bd.
  req.body.name = sampleFile.name;
  req.body.name_buscar = nombreSeparado[0].toLowerCase().replace(/\s+/g, "");
  req.body.imagen_url = imagen_url;
  const imagen_ = new Imagenes(req.body);
  // Guardar usuario
  const imagen_subida = await imagen_.save();
  console.log("imagen subida: ", imagen_subida);
  imagen_subida.imagen_url = path.join(
    __dirname,
    "../.." + imagen_subida.imagen_url
  );
  res.json({
    ok: true,
    imagen_subida,
  });
};

const deleteImage = async (req, res = response) => {
  const uid = req.params.id;

  try {
    const image_ = await imagenes.findById(uid);
    if (!image_) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un image por ese id",
      });
    }

    const imageActualizado = await imagenes.findByIdAndUpdate(
      uid,
      { estado: false },
      { new: true }
    );

    //await Pais.findByIdAndDelete( uid );

    res.json({
      ok: true,
      msg: "image eliminado",
      pais: imageActualizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const updateImage = async (req, res = response) => {
  const uid = req.params.id;

  try {
    const image_ = await imagenes.findById(uid);

    if (!image_) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un image por ese id",
      });
    }
    // Actualizaciones
    const { name, ...campos } = req.body;

    if (image_.name !== name) {
      const existeimage = await imagenes.findOne({ name });
      if (existeimage) {
        return res.status(400).json({
          ok: false,
          msg: "ya existe un image con ese nombre",
        });
      }
    }

    const imageActualizado = await imagenes.findByIdAndUpdate(uid, campos, {
      new: true,
    });

    res.json({
      ok: true,
      anio: imageActualizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

//se guardan imagen en el servidor y retorna el enlace
async function guardarImagenVariantesErrores(req) {
  try {
    console.log("Imagen recibida en funcion -> ", req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      return null;
    }

    const { variantesFile } = req.files;
    const nombreSeparado = variantesFile.name.split(".");
    const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
    var nombreImagen = uuidv4() + "." + formatoArchivo;

    const uploadPath = path.join(
      __dirname,
      "../../uploads/imagenes/catalogo/variantes-errores/" + nombreImagen
    );

    variantesFile.mv(uploadPath, (err) => {
      if (err) {
        console.log("error:", err);
        return null;
      }
    });

    const imagen_url = "/imagenes/catalogo/variantes-errores/" + nombreImagen;

    return imagen_url;
  } catch (error) {
    return null;
  }
}

async function guardarImagenEstampilla(req, id_solicitud) {
  try {
    console.log("Imagen recibida en funcion -> ", req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      return null;
    }

    const { estampillaFile } = req.files;
    const nombreSeparado = estampillaFile.name.split(".");
    const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
    var nombreImagen = uuidv4() + "." + formatoArchivo;

    const uploadPath = path.join(
      __dirname,
      "../../uploads/imagenes/catalogo/estampillas/" + nombreImagen
    );

    estampillaFile.mv(uploadPath, (err) => {
      if (err) {
        console.log("error:", err);
        return null;
      }
    });

    const imagen_url = "/imagenes/catalogo/estampillas/" + nombreImagen;

    //Guardando informacion de la imagen en la bd.
    req.body.name = nombreImagen;
    req.body.imagen_url = imagen_url;
    req.body.solicitud = id_solicitud;
    req.body.tipo_imagen = "estampilla";
    req.body.codigo_estampilla = uuidv4();

    const imagen_ = new Imagenes(req.body);
    // Guardar usuario
    const imagen_subida = await imagen_.save();
    return imagen_subida._id;
  } catch (error) {
    return null;
  }
}

module.exports = {
  getImages,
  createImageCat,
  createImageTema,
  deleteImage,
  updateImage,
  createImageEstampilla,
  guardarImagenEstampilla,
  guardarImagenVariantesErrores,
};
