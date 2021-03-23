const Paises = require("../models/catalogo/paises");
const axios = require("axios");
const { guardandoBanderas } = require("../middlewares/banderas");
const {crearPaisesAutom} = require("../middlewares/paises");
const Tipo_solicitud = require('../models/solicitudes/tipoEstadoSolicitud.model');

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
        "/imagenes/banderas_paises/" +
        datos.alpha3Code.toLowerCase() +
        ".svg",
    }));
    const resBan = await guardandoBanderas(await upaises);

    //se verifica que todo haya salido bien en la descarga de las imagen al servidor
    if (resBan.estado == 200) {
      console.log("Se han creado : ", resBan.banderas, " banderas");
  
    }else{
      console.log("error al crear los paieses: ", resBan);
    }

    const paisesCreados= await crearPaisesAutom(upaises);
    console.log("creando pasises: ", paisesCreados);

    console.log("Paises creados: ", paisesCreados.total);








  } else {
    console.log("*Paises OK");
  }
};

const verificarTipoSolicitudYCrearla = async () =>{
  console.log("verificando tipo de solicitud y crearlos");

  const tipoSolicitud = await Tipo_solicitud.find();
  if(tipoSolicitud.length>0){
    console.log("Tipos de solucitud OK");
    return;
  }
  console.log("No se encotraron tipos de solucitud, creando...");

  const nuevoTSolicitud = new Tipo_solicitud();
  nuevoTSolicitud.name = "En espera de aprobación del catalogo etapa 1";
  nuevoTSolicitud.abreviacion = "EACE1";
  nuevoTSolicitud.descripcion = "Se debe esperar la aprobación para poder subir las estampillas del catálogo";
  await nuevoTSolicitud.save();

  const nuevoTSolicitud_1 = new Tipo_solicitud();
  nuevoTSolicitud_1.name = "Aprobado catalogo etapa 1";
  nuevoTSolicitud_1.abreviacion = "ACE1";
  nuevoTSolicitud_1.descripcion = "Puedes subir tu catalogo con las respectivas estampillas, una vez terminado, haces la solicitud para la aprobación de etapa 2, la publicación";
  await nuevoTSolicitud_1.save();

  const nuevoTSolicitud_12 = new Tipo_solicitud();
  nuevoTSolicitud_12.name = "Rechazado catalogo etapa 1";
  nuevoTSolicitud_12.abreviacion = "RCE1";
  nuevoTSolicitud_12.descripcion = "";
  await nuevoTSolicitud_12.save();

  const nuevoTSolicitud_2 = new Tipo_solicitud();
  nuevoTSolicitud_2.name = "En espera de aprobación del catalogo etapa 2, la publicación del catálogo";
  nuevoTSolicitud_2.abreviacion = "EACE2";
  nuevoTSolicitud_2.descripcion = "Se debe esperar la aprobación para que el catalogo sea público para todos";
  await nuevoTSolicitud_2.save();


  const nuevoTSolicitud_3 = new Tipo_solicitud();
  nuevoTSolicitud_3.name = "Catalogo Publicado";
  nuevoTSolicitud_3.abreviacion = "ACE2";
  nuevoTSolicitud_3.descripcion = "El catalogo es público para todos";
  await nuevoTSolicitud_3.save();

  const nuevoTSolicitud_31 = new Tipo_solicitud();
  nuevoTSolicitud_31.name = "Catalogo Rechazado";
  nuevoTSolicitud_31.abreviacion = "RCE2";
  nuevoTSolicitud_31.descripcion = "";
  await nuevoTSolicitud_31.save();

 
return;


}

module.exports = {
  verificarBanderasPaises,
  verificarTipoSolicitudYCrearla
  
};
