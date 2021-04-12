const { response } = require("express");
const Estampillas = require("../../models/catalogo/estampillas.modelo");

const { v4: idUnico } = require("uuid");
const { guardarImagenEstampilla } = require("./uploads.controlador");
const { procesarExcel, crearSolicitud } = require("./catalogo.controlador");
const { isValidObjectId } = require("mongoose");
const catalogo = require("../../models/catalogo/catalogo");

const crearEstampillaIndividual = async (req, res = response) => {
  try {
    console.log(req.files);
    console.log(req.body);
    const { CATALOGO } = req.body;

    //Guardando foto estampilla
    const idImagenGuarada = await guardarImagenEstampilla(req, CATALOGO);
    if (idImagenGuarada == null) {
      return res.json({
        ok: false,
        msg: "error al crear imagen estampilla",
      });
    }
    console.log("ID imagen guardada", idImagenGuarada);

    var nuevaEstampilla = new Estampillas(req.body);

    nuevaEstampilla.CODIGO = idUnico();
    nuevaEstampilla.FOTO_ESTAMPILLAS = idImagenGuarada;

    const estampillaGuardada = await nuevaEstampilla.save();
    console.log(estampillaGuardada);

    return res.json({
      ok: true,
      msg: estampillaGuardada,
    });
  } catch (error) {
    return res.json({
      ok: false,
      error: error,
    });
  }
};
const subirEstampillasExcel = async (req, res = response) => {
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

  var datos = procesarExcel(req.files);
  const idCatalogo = req.body.id_catalogo;
  console.log("ID catalogo: ", idCatalogo);
  console.log("Datos ->", datos);

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
  var catalogoBD = await catalogo.findById(idCatalogo);

  //validando que el id enviado si es de un catalogo en a bd
  if (!catalogoBD || catalogoBD == null) {
    return res.json({
      ok: false,
      mensaje: "No existe el catalogo que deseas asociar.",
    });
  }

  var datosValidados = validarCamposExcel(datos);
  console.log("Datos validados ->", datosValidados);

  var completos = new Array();
  var incompletos = new Array();

  //Separando completos de incompletos.
  datosValidados.map((data) => {
    if (data.COMPLETA == true) {
      completos.push(data);
    } else {
      incompletos.push(data);
    }
    console.log("Completos ->", completos);
    console.log("Incompletos ->", incompletos);

    //Agrupar variantes y errores
    var datosFinal = agruparVariantes(completos);
  });
};
function validarCamposExcel(datos) {
  console.log("Datos recibidos ->", datos);
  var datosAValidar = new Array();

  //Validando que tenga datos
  if (datos.length > 0) {
    datosAValidar = datos;

    //Validando datos requeridos y asignandoles un boleano para separarlos
    datosAValidar.map((data) => {
      //Validando datos requiridos y asignando en Completa el true o false para separarles
      //Reellenando valores no reqieridos con NO ASIGNADO
      if (
        !data.CODIGO ||
        data.CODIGO == null ||
        data.CODIGO == "" ||
        !data.ANIO ||
        data.ANIO == null ||
        data.ANIO == "" ||
        !data.CATEGORIA ||
        data.CATEGORIA == null ||
        data.CATEGORIA == "" ||
        !data.TITULO_DE_LA_SERIE ||
        data.TITULO_DE_LA_SERIE == null ||
        data.TITULO_DE_LA_SERIE == "" ||
        !data.VALOR_FACIAL ||
        data.VALOR_FACIAL == null ||
        data.VALOR_FACIAL == "" ||
        !data.TIPO_MONEDA_VALOR_FACIAL ||
        data.TIPO_MONEDA_VALOR_FACIAL == null ||
        data.TIPO_MONEDA_VALOR_FACIAL == "" ||
        !data.TIPO ||
        data.TIPO == null ||
        data.TIPO == "" ||
        !data.TIPO ||
        data.TIPO == null ||
        data.TIPO == ""
      ) {
        data.COMPLETA = false;
      } else {
        data.COMPLETA = true;
      }

      //Como DESCRIPCION_ESTAMPILLA no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.DESCRIPCION_ESTAMPILLA ||
        data.DESCRIPCION_ESTAMPILLA == null ||
        data.DESCRIPCION_ESTAMPILLA == ""
      ) {
        data.DESCRIPCION_ESTAMPILLA = "NO ASIGNADO";
      }

      //Como GRUPO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (!data.GRUPO || data.GRUPO == null || data.GRUPO == "") {
        data.GRUPO = "NO ASIGNADO";
      }

      //Como NRO_ESTAMPILLAS no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.NRO_ESTAMPILLAS ||
        data.NRO_ESTAMPILLAS == null ||
        data.NRO_ESTAMPILLAS == ""
      ) {
        data.NRO_ESTAMPILLAS = "NO ASIGNADO";
      }

      //Como NUMERO_DE_CATALOGO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.NUMERO_DE_CATALOGO ||
        data.NUMERO_DE_CATALOGO == null ||
        data.NUMERO_DE_CATALOGO == ""
      ) {
        data.NUMERO_DE_CATALOGO = "NO ASIGNADO";
      }

      //Como VALOR_CATALOGO_NUEVO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.VALOR_CATALOGO_NUEVO ||
        data.VALOR_CATALOGO_NUEVO == null ||
        data.VALOR_CATALOGO_NUEVO == ""
      ) {
        data.VALOR_CATALOGO_NUEVO = "NO ASIGNADO";
      }

      //Como VALOR_DEL_CATALOGO_USADO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.VALOR_DEL_CATALOGO_USADO ||
        data.VALOR_DEL_CATALOGO_USADO == null ||
        data.VALOR_DEL_CATALOGO_USADO == ""
      ) {
        data.VALOR_DEL_CATALOGO_USADO = "NO ASIGNADO";
      }

      //Como MONEDA_VALOR_CATALOGO_NUEVO_USADO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.MONEDA_VALOR_CATALOGO_NUEVO_USADO ||
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO == null ||
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO == ""
      ) {
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO = "NO ASIGNADO";
      }

      //Como VARIANTES_ERRORES no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.VARIANTES_ERRORES ||
        data.VARIANTES_ERRORES == null ||
        data.VARIANTES_ERRORES == ""
      ) {
        data.VARIANTES_ERRORES = [];
        data.FOTO_VARIANTES_ERRORES = [];
      } else {
        //Como VARIANTES_ERRORES existe, se debe validar si existe un nombre en la foto de variantes y errores
        if (
          !data.FOTO_VARIANTES_ERRORES ||
          data.FOTO_VARIANTES_ERRORES == null ||
          data.FOTO_VARIANTES_ERRORES == ""
        ) {
          data.FOTO_VARIANTES_ERRORES = "NO ASIGNADO";
        }
      }
    });

    return datosAValidar;

    console.log("datos despues de asignar ->", datosAValidar);
  } else {
    return null;
  }
}

function agruparVariantes(datos) {
  if (datos.length > 0) {
    var datosAgrupados = new Array();
    var codigos = new Array();
    var repetidos = new Array();
    var variantes = new Object();
    var variantes_errores = new Object();
    datosAgrupados = datos;

    var contador = 0;

    datosAgrupados.map((data, i) => {
      if (data.CODIGO in variantes_errores) {
        console.log("Está", data.CODIGO);
        codigos = [];
        variantes = {};
        variantes_errores[data.CODIGO].map((er) => {
          codigos.push(er);
        });

        if (data.VARIANTES_ERRORES.length == 0) {
          variantes_errores[data.CODIGO] = codigos;
        } else {
          variantes.id = data.CODIGO;
          variantes.descripcion = data.VARIANTES_ERRORES;
          variantes.foto = data.FOTO_VARIANTES_ERRORES;
          codigos.push(variantes);

          variantes_errores[data.CODIGO] = codigos;
        }
      } else {
        codigos = [];
        variantes = {};

        //Validando que exista la descripción
        variantes.id = data.CODIGO;

        if (data.VARIANTES_ERRORES.length == 0) {
          variantes_errores[data.CODIGO] = [];
        } else {
          variantes.descripcion = data.VARIANTES_ERRORES;
          variantes.foto = data.FOTO_VARIANTES_ERRORES;
          codigos.push(variantes);
          variantes_errores[data.CODIGO] = codigos;
        }
      }
    });
    console.log("Variantes", variantes_errores);
    console.log("codigos", codigos);
  } else {
    return null;
  }
}
const crearCatalogo = async (req, res = response) => {
  try {
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
module.exports = {
  crearEstampillaIndividual,
  subirEstampillasExcel,
};
