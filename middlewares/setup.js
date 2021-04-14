const Paises = require("../models/catalogo/paises");
const axios = require("axios");
const { guardandoBanderas } = require("../middlewares/banderas");
const { crearPaisesAutom } = require("../middlewares/paises");
const Tipo_solicitud = require("../models/solicitudes/tipoEstadoSolicitud.model");
const Tipo_Catalogo = require("../models/catalogo/tipo_catalogo");
const Color = require("colors");
const TipoEstadoReporte = require("../models/moderacion/tipo-estado-reporte.model");

const initial_setup = async () => {
  console.log(Color.blue("Ejecutando initial setup..."));

  await verificarBanderasPaises();
  await verificarTipoSolicitudYCrearla();
  await VerificarTipoCatalogoYCrarlo();
  await verificarEstadoTipoReporte();
};

const verificarBanderasPaises = async () => {
  console.log("Verificando las banderas de los paises");

  //se verifica en la base de datos que existan paises, sino se consultan y se guardan.
  const existePais = await Paises.find();

  if (existePais.length == 0) {
    console.log("*No existen paises, crenado paises");

    //servicio para consultar informacion de los mpaises y liego guardarla
    const datosPaises = await axios({
      method: "GET",
      url: "https://restcountries.eu/rest/v2",
    });

    //mapeando los datos obtenidos del servicio, usando sólo lo que necesitamos
    const upaises = await datosPaises.data.map((datos) => ({
      name: datos.name,

      uriBandertas: datos.flag,
      moneda_nombre: datos.currencies[0].name,
      moneda_code: datos.currencies[0].code,
      abreviatura_uno: datos.alpha2Code,
      abreviatura_dos: datos.alpha3Code,
      img:
        "/imagenes/banderas_paises/" + datos.alpha3Code.toLowerCase() + ".svg",
    }));
    const resBan = await guardandoBanderas(await upaises);

    //se verifica que todo haya salido bien en la descarga de las imagen al servidor
    if (resBan.estado == 200) {
      console.log("Se han creado : ", resBan.banderas, " banderas");
    } else {
      console.log("error al crear los paieses: ", resBan);
    }

    const paisesCreados = await crearPaisesAutom(upaises);
    console.log("creando pasises: ", paisesCreados);

    console.log("Paises creados: ", paisesCreados.total);
  } else {
    console.log("*Paises OK");
  }
};
const verificarTipoSolicitudYCrearla = async () => {
  console.log("verificando tipo de solicitud y crearlos");

  const tipoSolicitud = await Tipo_solicitud.find();
  if (tipoSolicitud.length > 0) {
    console.log("Tipos de solucitud OK");
    return;
  }
  console.log("No se encotraron tipos de solucitud, creando...");

  const nuevoTSolicitud = new Tipo_solicitud();
  nuevoTSolicitud.name = "En espera de aprobación del catalogo etapa 1";
  nuevoTSolicitud.abreviacion = "EACE1";
  nuevoTSolicitud.descripcion =
    "Se debe esperar la aprobación para poder subir las estampillas del catálogo";
  await nuevoTSolicitud.save();

  const nuevoTSolicitud_1 = new Tipo_solicitud();
  nuevoTSolicitud_1.name = "Aprobado catalogo etapa 1";
  nuevoTSolicitud_1.abreviacion = "ACE1";
  nuevoTSolicitud_1.descripcion =
    "Puedes subir tu catalogo con las respectivas estampillas, una vez terminado, haces la solicitud para la aprobación de etapa 2, la publicación";
  await nuevoTSolicitud_1.save();

  const nuevoTSolicitud_2 = new Tipo_solicitud();
  nuevoTSolicitud_2.name =
    "En espera de aprobación del catalogo etapa 2, la publicación del catálogo";
  nuevoTSolicitud_2.abreviacion = "EACE2";
  nuevoTSolicitud_2.descripcion =
    "Se debe esperar la aprobación para que el catalogo sea público para todos";
  await nuevoTSolicitud_2.save();

  const nuevoTSolicitud_3 = new Tipo_solicitud();
  nuevoTSolicitud_3.name = "Catalogo Publicado";
  nuevoTSolicitud_3.abreviacion = "ACE2";
  nuevoTSolicitud_3.descripcion = "El catalogo es público para todos";
  await nuevoTSolicitud_3.save();

  return;
};
const VerificarTipoCatalogoYCrarlo = async () => {
  console.log("Verificando existencia de Tipo Catalgo");

  const tipoCatalogoBd = await Tipo_Catalogo.find();
  if (tipoCatalogoBd.length == 0) {
    console.log("No existe en BD Tipo Catalogo");
    console.log("Creando en BD Tipo Catalogo..");

    var objTipoCatalogo = new Tipo_Catalogo();
    objTipoCatalogo.name = "Temático";
    await objTipoCatalogo.save();

    var objTipoCatalogo1 = new Tipo_Catalogo();
    objTipoCatalogo1.name = "País";
    await objTipoCatalogo1.save();
    console.log("*Se crearon 2 Tipos de Catalogos.");
  }
};
const verificarEstadoTipoReporte = async () => {
  console.log("- Tipo Estado Reporte...");

  //Buscando en base de datos Tipo Estado Reporte
  var tipoEstadoReporte = await TipoEstadoReporte.find();

  console.log(" | Verificando en base de datos... ");
  if (tipoEstadoReporte.length != 0) {
    console.log("  | Tipo Estado Reporte Ok.");
  } else {
    console.log("  | No existe en base de datos.");
    console.log("   | Creando items...");

    //Contador para contar las veces que se guardó correctamente
    var contador = 0;

    //Creando items en BD

    //----------------------------

    //Creando primer item
    //TER -> Tipo Estado Reporte
    var objetoTER = new TipoEstadoReporte();
    objetoTER.nombre = "Procesado | Dato de baja";
    objetoTER.abreviacion = "P.DB";
    objetoTER.descripcion =
      "Reporte analizado, concluyendo que el Usuario incumple las normas de convivencia de la comunidad Filatelia.";

    //Guardando en BD
    var objetoGuardado = await objetoTER.save();

    //evaluando si se guardó;
    if (objetoGuardado._id) {
      contador = contador + 1;
    }

    //----------------------------

    //Creando segundo item
    //TER -> Tipo Estado Reporte
    objetoTER = {};
    objetoTER = new TipoEstadoReporte();
    objetoTER.nombre = "Procesado | Ignorado Acumulativo";
    objetoTER.abreviacion = "P.IA";
    objetoTER.descripcion =
      "Reporte analizado, concluyendo que el Usuario cometió una falta media a las normas de convivencia de la comunidad Filatelia.No se le da de baja al usuario, pero disminuye su reputación";

    //Guardando en BD
    var objetoGuardado = await objetoTER.save();

    //evaluando si se guardó;
    if (objetoGuardado._id) {
      contador = contador + 1;
    }

    //----------------------------

    //Creando tercer item
    //TER -> Tipo Estado Reporte
    objetoTER = {};
    objetoTER = new TipoEstadoReporte();
    objetoTER.nombre = "Procesado | Ignorado No Acumulativo";
    objetoTER.abreviacion = "P.INA";
    objetoTER.descripcion =
      "Reporte analizado, concluyendo que el Usuario no cometió una falta las normas de convivencia de la comunidad Filatelia.No se le da de baja al usuario, tampoco disminuye la reputación";

    //Guardando en BD
    var objetoGuardado = await objetoTER.save();

    //evaluando si se guardó;
    if (objetoGuardado._id) {
      contador = contador + 1;
    }

    //----------------------------

    //Creando cuarto item
    //TER -> Tipo Estado Reporte
    objetoTER = {};
    objetoTER = new TipoEstadoReporte();
    objetoTER.nombre = "No Procesado | Creado Espera Análisis";
    objetoTER.abreviacion = "NP.CEA";
    objetoTER.descripcion =
      "Reporte creado correctamente, en espera del Análisis del Administrador, para evaluar si el Usuario cometió una falta a las normas de convivencia de la comunidad Filatelia.Por el momento, éste estado de reporte no disminuye la reputación, ni cancelará la cuenta del Usuario Reportado";

    //Guardando en BD
    var objetoGuardado = await objetoTER.save();

    //evaluando si se guardó;
    if (objetoGuardado._id) {
      contador = contador + 1;
    }

    console.log("    | Se crearon "+ contador +" items en la base de datos.");
  }
};
module.exports = {
  verificarBanderasPaises,
  verificarTipoSolicitudYCrearla,
  initial_setup,
};
