const Paises = require("../models/catalogo/paises");
const axios = require("axios");
const { guardandoBanderas } = require("../middlewares/banderas");
const { crearPaisesAutom } = require("../middlewares/paises");
const Tipo_solicitud = require("../models/solicitudes/tipoEstadoSolicitud.model");
const Tipo_Catalogo = require("../models/catalogo/tipo_catalogo");
const Color = require("colors");
const TipoEstadoReporte = require("../models/moderacion/tipo-estado-reporte.model");
const Usuarios = require("../models/usuario/usuario");
const bcrypt = require("bcryptjs");
const TipoEsperadoEstampilla = require("../models/catalogo/tipoEsperadoEstampilla.model");
const {buscarPaisPorNombre} = require("../middlewares/paises");
const { verificarCrearTodasMonedas } = require("./moneda")

const initial_setup = async () => {
  console.log(Color.blue("Ejecutando initial setup..."));
  await verificarYCrearAdmin(); 
  await verificarBanderasPaises();
  await verificarTipoSolicitudYCrearla();
  await VerificarTipoCatalogoYCrarlo();
  await verificarEstadoTipoReporte();
  await verificarEstadoEsperadoEstampillaYCrearlo();
  await verificarCrearTodasMonedas();
};
const verificarYCrearAdmin = async () => {
  console.log("Verificando existencia de usuarios");
  var usuarioEnBD = await Usuarios.find();
  if (usuarioEnBD.length == 0) {
    console.log("No existen usurios.");
    console.log("Creando usurio Super Admin...");
  
  
      
      var pais = await buscarPaisPorNombre("Peru");
      if(!pais)throw {msg:'pais no encontrado',ok:false}
      const usuario_ = new Usuarios();
  
      usuario_.roleuser = "admin";
      usuario_.name = "Administrador";
      usuario_.apellidos = "Filatelia Peruana";
      usuario_.email = "filatelia.backend@gmail.com";
      usuario_.nickname = "SuperAdmin_filatelia";
      
      const salt = bcrypt.genSaltSync();
      usuario_.password = bcrypt.hashSync("22102281", salt);
      usuario_.pais_usuario=pais._id
      usuario_.imagenP =
        "/imagenes/predeterminadas/" + usuario_.roleuser + ".png";
      // Guardar usuario
      var usuarioGuardado = await usuario_.save();
      
      if (usuarioGuardado._id) {
        console.log("Se ha creado el usuario correctamente");
        
      }
    
  }
  else{
    console.log("Usuarios en BD OK.");

  }

}

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
      "<p>Reporte analizado, concluyendo que el Usuario incumple rotundamente las normas de convivencia de la comunidad Filatelia, se toman las siguientes medidas: </p> <p>1.  Se da de baja del sistema. </p> <p>2. Se borra todo tipo de información en nuestras bases de datos (estampillas, catálogos, datos personales, etcétera). </p>";

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
      "<p>Reporte analizado, concluyendo que el Usuario cometió una falta, y la falta es media a las normas de convivencia de la comunidad Filatelia, se tomaron medidas.</p> <p>No se le da de baja al usuario, pero disminuye su reputación en 20 puntos de 100 iniciales.</p> <p>Si un usuario disminuye por debajo de 50 puntos, se le dará de baja pero también se debe tener en cuenta que, en cualquier momento, el  administrador puede darle de baja por su incumplimiento a las reglas de la comunidad Filatelia.</p>";

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
      "<p>Reporte analizado, llegando a la conclusión que el Usuario no cometió falta las normas de convivencia de la comunidad Filatelia, por lo tanto:  </p> <p>1.  No se le da de baja al usuario </p>  <p>2. No disminuye la reputación. </p>";

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
      "<p>Reporte creado correctamente, en espera del Análisis del Administrador, para evaluar si el Usuario cometió una falta a las normas de convivencia de la comunidad Filatelia. </p>  <p>Por el momento, éste estado de reporte no disminuye la reputación, ni cancelará la cuenta del Usuario Reportado. </p>";

    //Guardando en BD
    var objetoGuardado = await objetoTER.save();

    //evaluando si se guardó;
    if (objetoGuardado._id) {
      contador = contador + 1;
    }

    console.log("    | Se crearon "+ contador +" items en la base de datos.");
  }
};
const verificarEstadoEsperadoEstampillaYCrearlo = async () => {
  console.log("- Tipo Estado Esperado Estampilla...");

  //Buscando en base de datos Tipo Estado Reporte
  var tipoEsperadoEstampillaBD = await TipoEsperadoEstampilla.find();

  console.log(" | Verificando en base de datos... ");
  if (tipoEsperadoEstampillaBD.length != 0) {
    console.log("  | Tipo estado esperado estampilla Ok.");
  } else {
    console.log("  | No existe en base de datos.");
    console.log("   | Creando items...");

    //Contador para contar las veces que se guardó correctamente
    var contador = 0;

    //Creando items en BD

    //----------------------------


    
    var objetoTER = await TipoEsperadoEstampilla.insertMany(
      [
        { name: "NUEVA" },
        { name: "USADA" },
        { name: "MNH" },
        { name: "SPD" },
        { name: "SOBRE" },
        { name: "CUADRO" },
        { name: "ES INDIFERENTE" }
      ]
    );

    console.log("    | Se crearon "+ objetoTER.length +" items en la base de datos.");
  }
};
module.exports = {
  verificarBanderasPaises,
  verificarTipoSolicitudYCrearla,
  initial_setup,
};
