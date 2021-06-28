const { response, request } = require("express");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const Imagenes = require("../../models/catalogo/uploads");
const { v4: idUnico } = require("uuid");
const {
  guardarImagenEstampilla,
  guardarImagenVariantesErrores,
} = require("./uploads.controlador");
const { procesarExcel, crearSolicitud } = require("./catalogo.controlador");
const { isValidObjectId } = require("mongoose");
const catalogo = require("../../models/catalogo/catalogo");
const VariantesErrores_ = require("../../models/catalogo/variantes-errores.modelo");
const {
  agregarVariantesErroresEstampilla,
} = require("../../controllers/catalogo/variantes-errores.controlador");
const { crearSegundaSolicitud } = require("../../funciones/solicitudes");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../funciones/validar-campos");
const { googleSheetFotoEstampilla, googleSheetVariantesErrores } = require("../google/google.controlador");
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
  console.log("Datos recibido", req.body);

  const nombreSeparado = req.files.sampleFile.name
    .toLowerCase()
    .replace(/\s+/g, "")
    .split(".");
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

  //Validando datos recibidos y preparandolos para el servidor
  var datosValidados = validarCamposExcel(datos);

  var completos = new Array();
  var incompletos = new Array();

  //Separando completos de incompletos.
  datosValidados.map((data) => {
    if (data.COMPLETA == true) {
      completos.push(data);
    } else {
      incompletos.push(data);
    }
  });



  //Guardando estampillas
  var esguarda = await guardarEstampillas(completos, idCatalogo);


  if (esguarda.length > 0) {
    //asociando imagenes principales de estampilla
    //Asociar Imagenes desde google meet
    await googleSheetFotoEstampilla(esguarda);

    //asociando variantes y errores de estampilla
  await googleSheetVariantesErrores(esguarda);



    //Creando solicitud
    await crearSegundaSolicitud(catalogoBD.solicitud._id);
    
  }else{
    return res.json({
      ok: false,
      msg: "No se han guardado las estampillas."
    })
  }

  return res.json({
    ok: true,
    msg: "aaa"
  });
};

function validarCamposExcel(datos) {
  var datosAValidar = new Array();

  //Validando que tenga datos
  if (datos.length > 0) {
    datosAValidar = datos;

    //Validando datos requeridos y asignandoles un boleano para separarlos
    datosAValidar.map((data) => {
      //Validando datos requiridos y asignando en Completa el true o false para separarles
      //Reellenando valores no reqieridos con N/A
      if (
        !data.CODIGO_NO_TOCAR ||
        data.CODIGO_NO_TOCAR == null ||
        data.CODIGO_NO_TOCAR == "" ||
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
        data.DESCRIPCION_ESTAMPILLA = "N/A";
      }

      //Como GRUPO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (!data.GRUPO || data.GRUPO == null || data.GRUPO == "") {
        data.GRUPO = "N/A";
      }

      //Como NRO_ESTAMPILLAS no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.NRO_ESTAMPILLAS ||
        data.NRO_ESTAMPILLAS == null ||
        data.NRO_ESTAMPILLAS == ""
      ) {
        data.NRO_ESTAMPILLAS = "N/A";
      }

      //Como NUMERO_DE_CATALOGO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.NUMERO_DE_CATALOGO ||
        data.NUMERO_DE_CATALOGO == null ||
        data.NUMERO_DE_CATALOGO == ""
      ) {
        data.NUMERO_DE_CATALOGO = "N/A";
      }

      //Como VALOR_CATALOGO_NUEVO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.VALOR_CATALOGO_NUEVO ||
        data.VALOR_CATALOGO_NUEVO == null ||
        data.VALOR_CATALOGO_NUEVO == ""
      ) {
        data.VALOR_CATALOGO_NUEVO = "N/A";
      }

      //Como VALOR_DEL_CATALOGO_USADO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.VALOR_DEL_CATALOGO_USADO ||
        data.VALOR_DEL_CATALOGO_USADO == null ||
        data.VALOR_DEL_CATALOGO_USADO == ""
      ) {
        data.VALOR_DEL_CATALOGO_USADO = "N/A";
      }

      //Como MONEDA_VALOR_CATALOGO_NUEVO_USADO no es obligatorio, le asignamos un valor para que exista, o tenga información
      if (
        !data.MONEDA_VALOR_CATALOGO_NUEVO_USADO ||
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO == null ||
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO == ""
      ) {
        data.MONEDA_VALOR_CATALOGO_NUEVO_USADO = "N/A";
      }
    });

    return datosAValidar;
  } else {
    return null;
  }
}

async function guardarEstampillas(datos, id_catalogo) {
  var datosGuardar = [];
  estampillasGuardadas = [];

  for (let index = 0; index < datos.length; index++) {
    var element = datos[index];

    var estampillaBD = await Estampillas.findOne({
      CODIGO: element.CODIGO_NO_TOCAR,
    });
    console.log("estampillaBD", estampillaBD);
    if (estampillaBD == null) {
      //asociando datos para guardar
      var temporal = new Object();

      temporal.CATALOGO = id_catalogo;
      temporal.CODIGO = element.CODIGO_NO_TOCAR;
      temporal.DESCRIPCION_ESTAMPILLA = element.DESCRIPCION_ESTAMPILLA;
      temporal.ANIO = element.ANIO;
      temporal.CATEGORIA = element.CATEGORIA;
      temporal.GRUPO = element.GRUPO;
      temporal.NRO_ESTAMPILLAS = element.NRO_ESTAMPILLAS;
      temporal.TITULO_DE_LA_SERIE = element.TITULO_DE_LA_SERIE;
      temporal.NUMERO_DE_CATALOGO = element.NUMERO_DE_CATALOGO;
      temporal.VALOR_FACIAL = element.VALOR_FACIAL;
      temporal.TIPO_MONEDA_VALOR_FACIAL = element.TIPO_MONEDA_VALOR_FACIAL;
      temporal.VALOR_CATALOGO_NUEVO = element.VALOR_CATALOGO_NUEVO;
      temporal.VALOR_DEL_CATALOGO_USADO = element.VALOR_DEL_CATALOGO_USADO;
      temporal.MONEDA_VALOR_CATALOGO_NUEVO_USADO =
        element.MONEDA_VALOR_CATALOGO_NUEVO_USADO;
      temporal.TIPO = element.TIPO;

      datosGuardar.push(temporal);
    }
  }
  var guardados = await Estampillas.insertMany(datosGuardar);
  return guardados;
}

const editarEstampillaIndividual = async (req = request, res = response) => {
  try {
    const { idEstampilla } = req.body;
    var array = [];

    array.push(idEstampilla);

    if (validarCamposGeneral(1, array) != true) {
      return res.json({
        ok: false,
        msg: "Debes enviar el Id de estampilla",
      });
    }
    if (isValidObjectIdGeneral(1, array) != true) {
      return res.json({
        ok: false,
        msg: "Debes enviar el Id válido",
      });
    }

    var filtro = { _id: idEstampilla };
    var actualziar = req.body;
    var estampillaEditadaBD = await Estampillas.findOneAndUpdate(
      filtro,
      actualziar,
      { new: true }
    );

    if (estampillaEditadaBD != null) {
      return res.json({
        ok: true,
        msg: estampillaEditadaBD,
      });
    } else {
      return res.json({
        ok: false,
        msg: "No existe una estampilla con el Id Proporcionado",
      });
    }
  } catch (error) {}
};
module.exports = {
  crearEstampillaIndividual,
  subirEstampillasExcel,
  editarEstampillaIndividual,
};
