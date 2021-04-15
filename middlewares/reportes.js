const TipoEstadoReporte = require("../models/moderacion/tipo-estado-reporte.model");
const Reportes = require("../models/moderacion/reportes.modelo");
const Chats = require("../models/moderacion/chats.modelo");
const { Mongoose, ObjectId } = require("mongoose");

async function consultarTipoEstadoReporteConAbreviacion(abreviacion) {
  try {
    const datosBD = await TipoEstadoReporte.findOne({ abreviacion });
    return datosBD;
  } catch (error) {
    console.log(
      "error en catch | consultarTipoEstadoReporteConAbreviacion(abreviacion)",
      error
    );
    return false;
  }
}

async function consultarTipoEstadoReporteConId(id) {
  try {
    const datosBD = await TipoEstadoReporte.findById(id);
    return datosBD;
  } catch (error) {
    console.log("error en catch | consultarTipoEstadoReporteConId(id)", error);
    return false;
  }
}

async function consultarReporteConIdReporte(idReporte) {
  try {
    return await Reportes.findById(idReporte);
  } catch (error) {
    console.log(
      "Error al buscar reporte | catch consultarReporteConIdReporte",
      error
    );
    return false;
  }
}
async function consultarTodosTiposEstadoReporte() {
  try {
    return await TipoEstadoReporte.find();
  } catch (error) {
    console.log(
      "Error al buscar reporte | catch consultarTodosTiposEstadoReporte",
      error
    );
    return false;
  }
}
async function consultarTodosMensajesCliente(idCliente) {
  const chatBD = await Chats.find({}, { conversation: 1 });

  var chats=  [];
chatBD.map((data) => {
    console.log("data.id_usuario");

  data.conversation.map((dar) => {
      if (dar.id_usuario == idCliente) {
        chats.push(dar);

      }
    });
   
  });

  console.log("we", chats);

  return chats;
}

module.exports = {
  consultarTipoEstadoReporteConAbreviacion,
  consultarReporteConIdReporte,
  consultarTipoEstadoReporteConId,
  consultarTodosTiposEstadoReporte,
  consultarTodosMensajesCliente,
};
