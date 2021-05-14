var excel = require("xlsx");
const Tema = require("../models/catalogo/temas");
const { response } = require("express");

const Img = require("../models/catalogo/uploads");

var colors = require("colors");

const verificarTemaYCrearlo = async (req, res = response, next) => {
  try {
    const exc = req.files;
    const datos = procesarExcel(exc);
    //   console.log("datios:", datos);

    var contador = 0;
    for (let index = 0; index < datos.length; index++) {
      var excel_sub = new Object();
      var tema_guardar = new Object();

      tema_guardar.name = datos[index].Tema;
      const name = datos[index].Tema;
      const tema = await Tema.findOne({ name });

      if (tema == null) {
        console.log(
          colors.blue(">No existe tema " + name + ", creando tema...")
        );
        try {
          //buscando temas para guardar
          const UrlImgBD = await buscandoUrlImgTema(name);
          tema_guardar.imagen = UrlImgBD;

          const objTema = new Tema(tema_guardar);

          const temaCreado = await objTema.save();
          console.log(colors.blue(">> Se ha creado el tema ", temaCreado.name));
          contador++;
        } catch (e) {
          return res.json({
            ok: false,
            msg: e,
          });
        }
      }
    }
    console.log(colors.blue(">>> Temas creados:", contador));

    next();
  } catch (e) {
    return res.json({
      ok: false,
      msg: "Ha ocurrido un error faltal, comuniquese con nel administrador: "
        .red,
      error: e,
    });
  }
};

const asignarImagenes = async (req, res, netx) => {};

//funciones
function procesarExcel(exc) {
  try {
    const tmp = exc.sampleFile.tempFilePath;
    const ex = excel.readFile(tmp);
    const nombreHoja = ex.SheetNames;
    let datos = excel.utils.sheet_to_json(ex.Sheets[nombreHoja[0]]);
    return datos;
  } catch (e) {
    console.log("error: ", e);
  }
}

async function buscandoUrlImgCat(name) {
  try {
    const name_buscar = name.toLowerCase();
    imagenExistente = await Img.findOne({ name_buscar });

    if (imagenExistente == null) {
      console.log(
        "No se encontrtó imagen para la estampilla '".blue +
          name +
          "', por lo tanto se le asigna una imagen predeterminada".blue
      );
      const imagen_url = "/uploads/imagenes/predeterminadas/estampillas.jpg";
      return imagen_url;
    }
    return imagenExistente.imagen_url;
  } catch (e) {
    console.log(
      "error al consultar imagen de estampilla, comuniquese con el administrador",
      e
    );
  }
}

async function buscandoUrlImgTema(name) {
  try {
    const name_buscar = name.toLowerCase();
    imagenExistente = await Img.findOne({ name_buscar });

    if (imagenExistente == null) {
      console.log(
        colors.blue(
          "No se encontrtó imagen para el tema '" +
            name +
            "', pro lo tanto se le asigna una imagen predeterminada"
        )
      );
      const imagen_url = "/uploads/imagenes/predeterminadas/temas.png";
      return imagen_url;
    }
    return imagenExistente.imagen_url;
  } catch (e) {
    console.log(
      "error al consultar imagen de tema, comuniquese con el administrador",
      e
    );
    return;
  }
}

module.exports = {
  asignarImagenes,
  verificarTemaYCrearlo,
  buscandoUrlImgCat,
};
