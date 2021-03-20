const { response } = require("express");
var excel = require("xlsx");
const Catalogo = require("../../models/catalogo/catalogo");
var colors = require("colors");
const Tema = require("../../models/catalogo/temas");
const Img = require("../../models/catalogo/uploads");
const fs = require("fs");
const Path = require("path");
const { getPaisByName } = require("../catalogo/pais.controlador");
const Pais = require("../../models/catalogo/paises");
const { crearTema } = require("../../middlewares/index.middle");

const crearCatalogo = async (req, res = response) => {
  try {
    const datos = procesarExcel(req.files);
    var completos = [];
    var inCompletos = [];

    for (let index = 0; index < datos.length; index++) {
      const element = datos[index];
      if (element.completo == true) {
        completos.push(element);
      } else {
        inCompletos.push(element);
      }
    }
    const datosFinal = await validarEstampillasRepetidas(completos);
    var contador = 0;
    var repetidos = [];
    var noRepetidos = [];
    for (let index = 0; index < datosFinal.length; index++) {
      if (datosFinal[index].repetido == false) {
        noRepetidos.push(datosFinal[index]);

        const element = datosFinal[
          index
        ].Foto_JPG_800x800_px.toLowerCase().replace(/\s+/g, "");
        datosFinal[index].ParaBuscar = datosFinal[
          index
        ].Foto_JPG_800x800_px.toLowerCase().replace(/\s+/g, "");

        const urlImagenCat = await buscandoUrlImgCat(element);

        datosFinal[index].Foto_JPG_800x800_px = urlImagenCat;

        //Buscando id pais con el nombre
        var { _id } = await buscarPaisNombre(datosFinal[index].Pais);
        datosFinal[index].Pais = _id;

        //Buscar o crear tema por nombre

        console.log("tema enviado", datosFinal[index].Tema);

        var temaCreado = await crearTema(datosFinal[index].Tema);

        console.log("tema creadossssss->", temaCreado);
        datosFinal[index].Tema = temaCreado;

        var nuevoCatalogo = new Catalogo(datosFinal[index]);
        console.log("Nuevo catalogo", nuevoCatalogo);

        const guardar = await nuevoCatalogo.save();
        console.log("Guardar::::", guardar);
      } else {
        contador = contador + 1;
        repetidos.push(datosFinal[index]);
      }
    }
    console.log("Estamplillas repetidas ->");
    console.log("Contador: ", contador);
    if (inCompletos.length == 0 && contador == 0) {
      return res.json({
        ok: true,
        tipo_mensaje: "100",
        msg:
          "Excel procesado, individualizado, validado y creado en forma de catálogo en un 100%",
        total_estampillas: completos.length,
      });
    } else {
      if (contador != 0 && inCompletos.length != 0) {
        return res.json({
          ok: true,
          tipo_mensaje: "f.r",
          msg:
            "Hubieron problemas para guardar todos los archivos porque datos *obligatorios del excel no estaban, si desea guardar todos los archivos revise el excel y otros se omitieron porque estaban repetidos",
          archivos_subidos: noRepetidos.length,
          numero_estampillas_incompletas: inCompletos.length,
          numero_estampillas_repetidas: contador,
          estampillas_erroneas: inCompletos,
          estampillas_repetidas: repetidos,
        });
      } else {
        if (contador != 0) {
          return res.json({
            ok: true,
            tipo_mensaje: "r",
            msg: "Se omitieron algunas estampillas por estar repetidas",
            archivos_subidos: noRepetidos.length,
            total_estampillas_omitidas: contador,
            estipillas_omitidas: repetidos,
          });
        }
        return res.json({
          ok: true,
          tipo_mensaje: "f",
          msg:
            "Hubieron problemas para guardar todos los archivos porque datos *obligatorios del excel no estaban, si desea guardar todos los archivos revise el excel",
          archivos_subidos: completos.length,
          errores: inCompletos.length,
          estampillas_erroneas: inCompletos,
        });
      }
    }
  } catch (e) {
    return res.json({
      ok: false,
      tipo_mensaje: "catch",
      msg: "Has subido un documento que no tiene el formato correcto",
      error: e,
    });
  }
};
//Actualizar estapillas repetidas desde el excel.
const editarCatExcel = async (req, res = response) => {
  try {
    const objActualizar = req.body;
    console.log("tamaño", objActualizar.length);
    if (objActualizar.length > 0) {
      for (let index = 0; index < objActualizar.length; index++) {
        const element = objActualizar[index];
        console.log("Element", element);
        var ParaBuscar = element.ParaBuscar;
        console.log("para buscar", ParaBuscar);

        const encontrarCatalogo = await Catalogo.findOne({
          ParaBuscar: element.ParaBuscar,
        });
        console.log("catalogo encontrado: ", encontrarCatalogo);
        encontrarCatalogo = objActualizar[index];
        encontrarCatalogo.Tipo = "";
        encontrarCatalogo.save();
      }
    }

    return res.json({
      ok: true,
      body: encontrarCatalogo,
    });
  } catch (e) {
    return res.json({
      ok: false,
      error: "error desde log",
      tipo: e,
    });
  }
};

const buscarPaisNombre = async (names) => {
  const para_buscar = names.toLowerCase().replace(/\s+/g, "");
  const paisEncontrado = await Pais.findOne({ para_buscar }, { _id: 1 });
  console.log("pais encontrado", paisEncontrado);
  return paisEncontrado;
};

const mostrarCatalogoPais = async (req, res) => {
  const { pais } = req.params;
  var buscar = pais.toLowerCase().replace(/\s+/g, "");

  const catalogoCompleto = await Catalogo.find();
  var paisBuscado = [];
  for (let index = 0; index < catalogoCompleto.length; index++) {
    const element = catalogoCompleto[index].Pais.para_buscar;
    if (element == buscar) {
      paisBuscado.push(catalogoCompleto[index]);
    }
  }

  res.json({
    ok: true,
    catalogoPorPais: paisBuscado,
  });
};

const mostrarCatalogo = async (req, res) => {
  const catalogoCompleto = await Catalogo.find();

  res.json({
    ok: true,
    catalogoCompleto: catalogoCompleto,
  });
};
const eliminarCatalogo = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("entramos a eliminar", id);

    const eliminarElementoCatalogo = await Catalogo.findOneAndDelete(id);
    console.log("elemento eliminado:", eliminarElementoCatalogo);

    return res.json({
      ok: true,
      msg: "eliminado correctamente",
    });
  } catch (e) {
    return res.json({
      ok: false,
      msg: "No se ha podido eliminar correctamente",
      error: e,
    });
  }
};

//funciones
function procesarExcel(exc) {
  try {
    const tmp = exc.sampleFile.tempFilePath;
    const ex = excel.readFile(tmp);

    const nombreHoja = ex.SheetNames;
    let datos = excel.utils.sheet_to_json(ex.Sheets[nombreHoja[0]]);
    var datosValidos = new Array();
    var datosValidados = validarCamposExcel(datos);

    return datosValidados;
  } catch (e) {
    console.log("error: ", e);
  }
}

//Se validan los campos del excel que vienen vacios o defectuosos
function validarCamposExcel(datos) {
  for (let index = 0; index < datos.length; index++) {
    const element = datos[index];

    if (!element.Valor_del_Catalogoe || element.Valor_del_Catalogo == "") {
      console.log(
        colors.yellow(
          "-Valor del catalogo no proporcionado en estampilla " +
            element.Codigo +
            " se le asigna el EN BLANCO"
        )
      );
      element.Valor_del_Catalogo = "EN BLANCO";
    }

    if (!element.Descripcion || element.Descripcion == "") {
      console.log(
        colors.yellow(
          "-Descripción no proporcionado en estampilla " +
            element.Codigo +
            " se le asigna el EN BLANCO"
        )
      );

      element.Descripcion = "EN BLANCO";
    }
    if (!element.Valor_Facial || element.Valor_Facial == "") {
      console.log(
        colors.yellow(
          "-Valor Facial no proporcionado en estampilla " +
            element.Codigo +
            " se le asigna el EN BLANCO"
        )
      );

      element.Valor_Facial = "EN BLANCO";
    }
    if (
      !element.Codigo ||
      element.Codigo == "" ||
      !element.Pais ||
      element.Pais == "" ||
      !element.Anio ||
      element.Anio == "" ||
      !element.Tema ||
      element.Tema == "" ||
      !element.Grupo ||
      element.Grupo == "" ||
      !element.Nro_Estampillas ||
      element.Nro_Estampillas == "" ||
      !element.Numero_de_catalogo ||
      element.Numero_de_catalogo == "" ||
      !element.Tipo ||
      element.Tipo == "" ||
      !element.Foto_JPG_800x800_px ||
      element.Foto_JPG_800x800_px == ""
    ) {
      element.completo = false;
    } else {
      element.completo = true;
    }
  }

  return datos;
}
//Se verifica si las espampillas subidas ya existen en la base de datos
async function validarEstampillasRepetidas(datosValidados) {
  var estampillasRepetidas = [];
  for (let index = 0; index < datosValidados.length; index++) {
    const element = datosValidados[index];
    if (element.completo == true) {
      const buscarRepetido = await Catalogo.findOne({
        ParaBuscar: element.Foto_JPG_800x800_px.toLowerCase().replace(
          /\s+/g,
          ""
        ),
      });
      if (buscarRepetido != null) {
        element.repetido = true;
      } else {
        element.repetido = false;
      }
      estampillasRepetidas.push(element);
    }
  }

  return estampillasRepetidas;
}

async function buscandoUrlImgCat(name) {
  try {
    const name_buscar = name.toLowerCase();
    imagenExistente = await Img.findOne({ name_buscar });

    if (imagenExistente == null) {
      console.log(
        colors.blue(
          ">No se encontrtó imagen para la estampilla " +
            name +
            ", por lo tanto se le asigna una imagen predeterminada"
        )
      );
      const imagen_url = "/imagenes/predeterminadas/estampillas.jpg";
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

module.exports = {
  crearCatalogo,
  mostrarCatalogo,
  eliminarCatalogo,
  editarCatExcel,
  mostrarCatalogoPais,
};
