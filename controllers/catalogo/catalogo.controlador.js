const { response } = require("express");
var excel = require("xlsx");
const Catalogo = require("../../models/catalogo/catalogo");
var colors = require("colors");
const Tema = require("../../models/catalogo/temas");
const Img = require("../../models/catalogo/uploads");
const fs = require("fs");
const Path = require("path");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const { getPaisByName } = require("../catalogo/pais.controlador");
const Pais = require("../../models/catalogo/paises");
const { crearTema, enviarCorreos } = require("../../middlewares/index.middle");
const { isValidObjectId } = require("mongoose");
const { retornarDatosJWT } = require("../../middlewares/index.middle");
const Tipo_solicitud = require("../../models/solicitudes/tipoEstadoSolicitud.model");
const Solicitud = require("../../models/solicitudes/solicitudes.model");
const { ObjectId } = require("mongoose").Types;
const { validarCamposGeneral } = require("../../middlewares/validar-campos");
const { consultarCatalogosIdUsuario } = require("../../middlewares/catalogo");

const crearCatalogo = async (req, res = response) => {
  try {
    //Validando que sí se esté enviando información
    if (!req.files || req.files == null) {
      return res.json({
        ok: false,
        mensaje: "Debes enviar un archivo",
      });
    }

    console.log("documento recibido", req.files);
    const nombreSeparado = req.files.sampleFile.name.split(".");
    const formatoArchivo = nombreSeparado[nombreSeparado.length - 1];
    if (formatoArchivo.toLowerCase() != "xlsx") {
      return res.json({
        ok: false,
        mensaje: "Solo se permiten archivos de formato .xlsx",
        formato_enviado: formatoArchivo,
      });
    }

    const datos = procesarExcel(req.files);
    const idCatalogo = req.body.id_catalogo;
    console.log("ID catalogo: ", idCatalogo);

    //Validando que exista un catalogo para asociar a las estampillas
    if (!idCatalogo || idCatalogo == null) {
      return res.json({
        ok: false,
        mensaje: "Debes asociar las estampillas a un catalogo",
      });
    }
    //Validando que el id que se recibe sea un id valido
    if (!isValidObjectId(idCatalogo)) {
      return res.json({
        ok: false,
        mensaje: "Debes enviar un catalogo válido",
      });
    }
    var catalogoBD = await Catalogo.findById(idCatalogo);
    //validando que el id enviado si es de un catalogo en a bd
    if (!catalogoBD || catalogoBD == null) {
      return res.json({
        ok: false,
        mensaje: "No existe el catalogo que deseas asociar.",
      });
    }
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
    const datosFinal = await validarEstampillasRepetidas(completos, idCatalogo);
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
        var pais = await buscarPaisNombre(datosFinal[index].Pais);
        if (pais) {
          var _id = pais;
          datosFinal[index].Pais = _id;

          //Buscar o crear tema por nombre

          console.log("tema enviado", datosFinal[index].Tema);

          var temaCreado = await crearTema(datosFinal[index].Tema);

          console.log("tema creadossssss->", temaCreado);
          datosFinal[index].Tema = temaCreado;
          datosFinal[index].Catalogo = idCatalogo;

          var nuevoCatalogo = new Estampillas(datosFinal[index]);
          console.log("Nuevo catalogo", nuevoCatalogo);

          const guardar = await nuevoCatalogo.save();
          console.log("Guardar::::", guardar);
        } else {
          inCompletos.push(element);
        }
      } else {
        contador = contador + 1;
        repetidos.push(datosFinal[index]);
      }
    }

    await crearSolicitud(idCatalogo);
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
            estampillas_repetidas: repetidos,
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
async function crearSolicitud(id_catalogo) {
  console.log("Id catalogo", id_catalogo);
  var id_solicitud = await Catalogo.findOne({ _id: id_catalogo });

  console.log("Id solicitud desde excel", id_solicitud);
  if (id_solicitud._id && id_solicitud.solicitud != null) {
    var id_estadoSolicitud = id_solicitud.solicitud;
    const abreviacionSolicitud = await Solicitud.findById(id_estadoSolicitud);
    console.log("abreviacionSolicitud --->", abreviacionSolicitud);
    const abreviacionConIdRecibido = await Tipo_solicitud.findOne({
      _id: abreviacionSolicitud.tipoEstadoSolicitud_id,
    });

    if (abreviacionConIdRecibido.abreviacion == "ACE1") {
      console.log("ACE1 ---> pasa a EACE2");
      var { _id } = await Tipo_solicitud.findOne(
        { abreviacion: "EACE2" },
        { _id: 1 }
      );

      abreviacionSolicitud.tipoEstadoSolicitud_id = _id;
      console.log("Abreviacion: ", abreviacionSolicitud);
      var solicitudActuaizada = await abreviacionSolicitud.save();
      await enviarCorreos(
        null,
        solicitudActuaizada.usuario_id.email,
        solicitudActuaizada.usuario_id.name,
        solicitudActuaizada.tipoEstadoSolicitud_id.descripcion
      );

      return solicitudActuaizada;
    }
  }
}
//Actualizar estapillas repetidas desde el excel.
const editarCatExcel = async (req, res = response) => {
  try {
    //Se guarda el body
    const objActualizar = req.body;

    console.log("Tamaño array recibido", objActualizar.length);
    let total_elementos_actualizar = objActualizar.length;

    var actualizados = [];

    if (objActualizar.length > 0) {
      for (let index = 0; index < objActualizar.length; index++) {
        const element = objActualizar[index];
        console.log("sde envia en Pais -> ", objActualizar[index].Pais);
        console.log("sde envia en Tema -> ", objActualizar[index].Tema);

        var { _id } = await buscarPaisNombre(objActualizar[index].Pais);
        var temaCreado = await crearTema(objActualizar[index].Tema);
        element.Pais = _id;
        element.Tema = temaCreado;

        var ParaBuscar = element.ParaBuscar;
        const encontrarCatalogo = await Estampillas.findOneAndUpdate(
          ParaBuscar,
          element,
          { new: true }
        );

        if (encontrarCatalogo && encontrarCatalogo != null) {
          actualizados.push(element);
        }

        console.log("guardado", encontrarCatalogo);
      }
    } else {
      return res.json({
        ok: false,
        mensaje: "Debes enviar un objeto que contenga datos",
      });
    }

    return res.json({
      ok: true,
      total_elementos_actualizar: total_elementos_actualizar,
      total_elementos_actualizados: actualizados.length,
      elementos_actualizados: actualizados,
    });
  } catch (e) {
    console.log("error", e);
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

  const catalogoCompleto = await Estampillas.find();
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

//Mostrar catalogo por rango de años
const mostrarCatalogoAnio = async (req, res) => {
  const { anioI, anioF } = req.params;
  const { pais, tema } = req.query;
  try {
    var query_cat = {};
    if (pais && pais != "") {
      query_cat.pais = ObjectId(pais.trim());
    } else if (tema && tema != "") {
      query_cat.tema_catalogo = ObjectId(tema);
    }
    var catalogo = await Catalogo.find(query_cat, {
      tema_catalogo: 0,
      solicitud: 0,
      tipo_catalogo: 0,
      pais: 0,
    });
    var id_catalogo = "";
    if (!catalogo || catalogo.length == 0) throw "error list";
    id_catalogo = ObjectId(catalogo[0]._id);

    if (Number(anioI) && Number(anioF)) {
      const estampillas = await Estampillas.find({
        $and: [
          {
            ANIO: {
              $gte: Number(anioI),
            },
          },
          {
            ANIO: {
              $lte: Number(anioF),
            },
          },
          { CATALOGO: id_catalogo },
        ],
      }).count();
      console.log(id_catalogo);
      const catalogoCompleto = await Estampillas.aggregate([
        {
          $addFields: {
            regex: {
              $regexFind: {
                input: "$ANIO",
                regex: "^\\d+",
              },
            },
          },
        },
        {
          $set: {
            anio: {
              $convert: {
                input: "$regex.match",
                to: "int",
              },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                anio: {
                  $gte: Number(anioI),
                },
              },
              {
                anio: {
                  $lte: Number(anioF),
                },
              },
              { CATALOGO: id_catalogo },
            ],
          },
        },
        {
          $group: {
            _id: "$anio",
          },
        },
        {
          $project: {
            anio: "$_id",
          },
        },
      ]);

      res.json({
        ok: true,
        data: catalogoCompleto,
        total: estampillas,
        start: Number(anioI),
        end: Number(anioF),
      });
    } else {
      res.json({
        ok: false,
        catalogoPorPais: "Recierda que debes enviar valores numéricos",
        datos_recibidos: "Año inicial: " + anioI + " | Año final: " + anioF,
      });
    }
  } catch (e) {
    return res.json({
      ok: false,
      mensaje:
        "Error crítico, comunicate con el administrador | catalogoControlador-> mostrarCatalogoAnio()",
    });
  }
};

const mostrarCatalogo = async (req, res) => {
  const catalogoCompleto = await Catalogo.find({ estado: true });
  var cat = [];
  for (let index = 0; index < catalogoCompleto.length; index++) {
    const element = catalogoCompleto[index]._id;
    var nuevoCat = await Estampillas.find({ Catalogo: element });
    if (nuevoCat.length > 0) cat.push(nuevoCat);
  }

  return res.json({
    ok: true,
    catalogoCompleto: cat,
  });
};
const eliminarCatalogo = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("entramos a eliminar", id);

    const eliminarElementoCatalogo = await Estampillas.remove({ _id: id });
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

const mostrarMisCatalogos = async (req, res) => {
  //{"sort" : ['datefield', 'asc']}
  const token = req.header("x-access-token");

  var email = retornarDatosJWT(token);

  const catalogoBD = await Catalogo.find();

  var catalosgos = [];
  for (let index = 0; index < catalogoBD.length; index++) {
    const element = catalogoBD[index].solicitud;

    if (element.usuario_id.email == email) {
      catalosgos.push(catalogoBD[index]);
    }
  }
  return res.json({
    ok: true,
    catalogo: catalosgos,
  });
};
const mostrarMisEstampillas = async (req, res) => {
  var id_catalogo = req.query.id_catalogo;

  var estampillasCat = await Estampillas.find({ CATALOGO: id_catalogo });

  return res.json({
    ok: true,
    estampillas: estampillasCat,
  });
};

const mostrarCatalogoId = async (req, res) => {
  var id_solicitud = req.params.id;
  console.log("id_solicitud", id_solicitud);

  if (!id_solicitud || id_solicitud == null || !isValidObjectId(id_solicitud)) {
    return res.json({
      ok: false,
      msg: "Debes enviar una solicitud valido",
    });
  }

  var catalogo = await Catalogo.findOne({ solicitud: id_solicitud });
  if (catalogo == null) {
    return res.json({
      ok: false,
      msg: "No existe el catalogo que deseas buscar",
    });
  }

  return res.json({
    ok: true,
    catalogo: catalogo,
  });
};

//funciones
function procesarExcel(exc) {
  try {
    const tmp = exc.sampleFile.tempFilePath;
    const ex = excel.readFile(tmp);

    const nombreHoja = ex.SheetNames;
    let datos = excel.utils.sheet_to_json(ex.Sheets[nombreHoja[0]]);
    var datosValidos = new Array();
    //var datosValidados = validarCamposExcel(datos);

    return datos;
  } catch (e) {
    console.log("error: ", e);
  }
}

//funciones
function procesarExcelPruebas(tmp) {
  // try {
  //   const ex = excel.readFile(tmp);
  //   const ex = excel.readFile(tmp);
  //   const nombreHoja = ex.SheetNames;
  //   let datos = excel.utils.sheet_to_json(ex.Sheets[nombreHoja[0]]);
  //   var datosValidos = new Array();
  //   //var datosValidados = validarCamposExcel(datos);
  //   return datos;
  // } catch (e) {
  //   console.log("error: ", e);
  // }
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
async function validarEstampillasRepetidas(datosValidados, id_catalogo) {
  var estampillasRepetidas = [];
  for (let index = 0; index < datosValidados.length; index++) {
    const element = datosValidados[index];
    if (element.completo == true) {
      const buscarRepetido = await Estampillas.findOne({
        $and: [
          {
            ParaBuscar: element.Foto_JPG_800x800_px.toLowerCase().replace(
              /\s+/g,
              ""
            ),
          },
          {
            Catalogo: id_catalogo,
          },
        ],
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

const estampillaPage = async (req, res) => {
  try {
    let { perpage, page, tipo, pais, tema, anios, q, start, end } = req.query;
    page = parseInt(page) || 1;
    perpage = parseInt(perpage) || 10;
    var query = {};
    var query_cat = {};
    if (pais && pais != "") {
      query_cat.pais = ObjectId(pais.trim());
    } else if (tema && tema != "") {
      query_cat.tema_catalogo = ObjectId(tema);
    }

    var catalogo = await Catalogo.find(query_cat, {
      tema_catalogo: 0,
      solicitud: 0,
      tipo_catalogo: 0,
      pais: 0,
    });
    var id_catalogo = "";
    if (!catalogo || catalogo.length == 0) throw "error list";

    if (anios && anios != "") {
      anios = JSON.parse(anios);
      query = { $or: [] };
      anios.forEach((element) => {
        query.$or.push({
          ANIO: element,
        });
      });
    }

    if (q && q != "") {
      if (!query.$or) query.$or = [];
      console.log(isNaN(q));
      if (!isNaN(q)) {
        query.$or.push({
          ANIO: q,
        });
      } else {
        query.$or.push({
          Descripcion: { $regex: q, $options: "i" },
        });
        query.$or.push({
          Descripcion_de_la_serie: { $regex: q, $options: "i" },
        });
        query.$or.push({
          Valor_Facial: { $regex: q, $options: "i" },
        });
        query.$or.push({
          Codigo: { $regex: q, $options: "i" },
        });
      }
    }
    if (start != 0 && end != 0) {
      query.$and = [
        {
          ANIO: {
            $gte: Number(start),
          },
        },
        {
          ANIO: {
            $lte: Number(end),
          },
        },
      ];
    }

    id_catalogo = catalogo[0]._id;
    query.CATALOGO = ObjectId(id_catalogo);
    var estampillas = await Estampillas.find(query, { CATALOGO: 0 })
      .skip(perpage * page - perpage)
      .limit(perpage);
    var count = await Estampillas.find(query).count();
    res.status(200).send({
      data: estampillas,
      current: page,
      pages: Math.ceil(count / perpage),
    });
  } catch ($e) {
    res.status(400).send({
      msg: $e,
      ok: false,
    });
  }
};
const listarCatalogosIdUsuario = async (req, res) => {
  const { idUsuario, asd } = req.params;

  var ArrayElementos = new Array();

  ArrayElementos.push(idUsuario);
  var validación = validarCamposGeneral(1, ArrayElementos);

  if (validación != true) {
    return res.json({
      ok: false,
      msg: "Debes enviar los datos obligatorios.",
    });
  }
  var catalogoIDUsuario = await consultarCatalogosIdUsuario(idUsuario);

  if (catalogoIDUsuario.length == 0) {
    return res.json({
      ok: false,
      msg: "El usuario reportado no tiene catalogos",
    });
  } else {
    if (catalogoIDUsuario == false) {
      return res.json({
        ok: false,
        msg: "Error en consulta de catalogos.",
      });
    } else {
      return res.json({
        ok: true,
        msg: catalogoIDUsuario,
      });
    }
  }
};
module.exports = {
  crearCatalogo,
  mostrarCatalogo,
  eliminarCatalogo,
  editarCatExcel,
  mostrarCatalogoPais,
  mostrarCatalogoAnio,
  mostrarMisCatalogos,
  mostrarMisEstampillas,
  mostrarCatalogoId,
  estampillaPage,
  procesarExcel,
  crearSolicitud,
  procesarExcelPruebas,
  listarCatalogosIdUsuario,
};
