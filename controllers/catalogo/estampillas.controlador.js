const { response } = require("express");
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
const { crearSegundaSolicitud } = require("../../middlewares/solicitudes");
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
 var esguarda= await guardarEstampillas(completos, idCatalogo);

  //Agrupar variantes y errores
  console.log("Agrupando variantes y errores...");

  var variantesErrores = agruparVariantes(completos);
var ids= [];
  for (let index = 0; index < variantesErrores.length; index++) {
    const element = variantesErrores[index];

    ids = Object.keys(element);
    
  }

  //Asociando variables y errores a estampilla
  // await asociarVariablesYErrores(variantesErrores);
   await asociarVariablesYErrores(completos);
   await crearSegundaSolicitud(catalogoBD.solicitud._id);

  return res.json({
    ok: true,
    msg: esguarda,
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
        data.VARIANTES_ERRORES = null;
        if (
          !data.FOTO_VARIANTES_ERRORES ||
          data.FOTO_VARIANTES_ERRORES == null ||
          data.FOTO_VARIANTES_ERRORES == ""
        ) {
          data.FOTO_VARIANTES_ERRORES = null;
        } else {
          console.log("encontre");
          data.COMPLETA = false;
        }
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
  } else {
    return null;
  }
}

function agruparVariantes(datos) {
  if (datos.length > 0) {
    var datosAgrupados = new Array();
    var codigos = new Array();
    codigos = datos;
    var arrayObjetos = new Array();
    var variantes_errores = new Object();
    var variantes = new Object();
    var contador = 0;
    for (let index = 0; index < datos.length; index++) {
      const element = datos[index];

      contador = 0;
      if (variantes_errores[element.CODIGO]) {
        console.log("Existe");
        variantes = {};
        variantes.id = element.CODIGO;
        variantes.descripcion = element.VARIANTES_ERRORES;
        variantes.imagen = element.FOTO_VARIANTES_ERRORES;
        variantes_errores[element.CODIGO].push(variantes);
      } else {
        console.log("No existe");
        variantes = {};

        variantes.id = element.CODIGO;
        variantes.descripcion = element.VARIANTES_ERRORES;
        variantes.imagen = element.FOTO_VARIANTES_ERRORES;
        variantes_errores[element.CODIGO] = [variantes];
      }
    }

    return [variantes_errores];
  } else {
    return null;
  }
}
async function guardarEstampillas(datos, id_catalogo) {
  var datosGuardar = [];
  estampillasGuardadas = [];
  var temporal = [];
  for (let index = 0; index < datos.length; index++) {
    var element = datos[index];

    //consultando id estampilla
    const imagenEstampillaBD = await Imagenes.findOne({
      codigo_estampilla: element.CODIGO,
    });
    if (imagenEstampillaBD != null) {
      var estampillaBD = await Estampillas.findOne({ CODIGO: element.CODIGO });
      if (estampillaBD == null) {
        //asociando datos para guardar

        temporal.CATALOGO = id_catalogo;
        temporal.FOTO_ESTAMPILLAS = imagenEstampillaBD._id;
        temporal.CODIGO = element.CODIGO;
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

        const objEstampilla = new Estampillas(temporal);

        const estampillaGuardada = await objEstampilla.save();
        if (estampillaGuardada._id) {
          element.guardado = false;
          datosGuardar.push(element);
        } else {
          element.guardado = false;
          datosGuardar.push(element);
        }
      }
    } else {
      element.guardado = false;
      datosGuardar.push(element);
    }
  }
  return datosGuardar;
}

async function asociarVariablesYErrores(data) {
var asociados = new Array();
  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    var objeto= new Object();

    objeto.nombre_imagen_excel =  element.FOTO_VARIANTES_ERRORES;
        objeto.Descripcion = element.VARIANTES_ERRORES;
        objeto.codigo_excel = element.CODIGO;

        console.log("Objeto", objeto);
  
        var objVariantes = new VariantesErrores_(objeto);
        const varianteGuardada = await objVariantes.save();
        if (varianteGuardada._id) {
          //Buscando estampilla con codigo
          var estampillaBD = await Estampillas.findOne({ CODIGO: element.CODIGO });
          if (estampillaBD == null) {
            console.log("Null en buscar estampilla");
          } else {
            const modificarEstampilla = await agregarVariantesErroresEstampilla(
              estampillaBD._id,
              varianteGuardada._id
            );
            if (modificarEstampilla._id) {
              console.log("variante y error asociada en BD");
              asociados.push(modificarEstampilla);
            } else {
              console.log("Null en modificar estampilla");
            }
          }
        } else {
          console.log("Null en guardar variante");
        }
    
  }

}
module.exports = {
  crearEstampillaIndividual,
  subirEstampillasExcel,
};
