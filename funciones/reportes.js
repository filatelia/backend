const TipoEstadoReporte = require("../models/moderacion/tipo-estado-reporte.model");
const Reportes = require("../models/moderacion/reportes.modelo");
const Chats = require("../models/moderacion/chats.modelo");
const { ObjectId } = require("mongoose").Types;

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

async function consultarMensajesConIdRoom(arrayIds){
  var arrayMensajes = [];
  for (let index = 0; index < arrayIds.length; index++) {
    const element = arrayIds[index][0].id_mensaje;
    console.log("elemnt interno", element);
    

  

   
  }
  return arrayMensajes;
}

const paPruebas = async (req, res= response) => {

  var { mensajes } = req.body;

  var chats = await consultarMensajeConIdClienteIdMensaje(mensajes);

  return res.json({
    ok: true,
    msg: chats
  })
  

}

async function consultarMensajeConIdClienteIdMensaje(ids_mensajes, id_usuario) {

  var mensajes = [];
  var idCliente = id_usuario;
 

    for (let index = 0; index < ids_mensajes.length; index++) {
      const element = ids_mensajes[index];
      var chatBD = await Chats.aggregate(
        [
          {
            $unwind: '$conversation'
          },
          {
           $project: {
            id_documento: "$_id",
            id_mensaje:"$conversation._id",
            id_usuario:"$conversation.id_usuario",
            mensaje: "$conversation.message",
            eliminar: "$conversation.deleted_at"
            }
          },
          {
            $match: {
              id_usuario: ObjectId(idCliente),
              id_mensaje: ObjectId(element)

    
            }
          }
        ]);


        


        if (chatBD.length > 0) {
          var paraEditar = await Chats.findById(chatBD[0]._id);

        for (let ind = 0; ind < paraEditar.conversation.length; ind++) {
          var el = paraEditar.conversation[ind];

          if (el._id == element) {
            console.log("el igualado", el);
            el.deleted_at = Date.now();
            await paraEditar.save();


          }
          
        }
          mensajes.push(chatBD);
        }
    
    }
  
  console.log("Chat bd ->", mensajes);

  return mensajes;
}

module.exports = {
  consultarTipoEstadoReporteConAbreviacion,
  consultarReporteConIdReporte,
  consultarTipoEstadoReporteConId,
  consultarTodosTiposEstadoReporte,
  consultarTodosMensajesCliente,
  consultarMensajeConIdClienteIdMensaje,
  paPruebas,
  consultarMensajesConIdRoom
};
