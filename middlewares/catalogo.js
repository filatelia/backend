const { response } = require("express");
const Catalogo = require("../models/catalogo/catalogo");
const Solicitudes = require("../models/solicitudes/solicitudes.model");
const { ObjectId } = require("mongoose").Types;
const crearCatalogo = async (
  nombreCatalogo,
  id_solicitud,
  id_pais,
  id_tipo_catalogo,
  id_tema,
  estadoCat
) => {
  try {
    console.log("Entramos a catalogo");

    var nuevoCat = new Catalogo();
    nuevoCat.name = nombreCatalogo;
    nuevoCat.solicitud = id_solicitud;
    nuevoCat.tipo_catalogo = id_tipo_catalogo;
    nuevoCat.pais = id_pais;
    if (estadoCat) {
      nuevoCat.estado = estadoCat;
    }
    nuevoCat.tema_catalogo = id_tema;
    console.log("nuevoCat", nuevoCat);
    var nuevoC = await nuevoCat.save();
    console.log("Nuevo c caralogo middel", nuevoC);
    return nuevoC;
  } catch (e) {
    console.log("Error al crear catálogo catch catalogo middlewears", error);
    return false;
  }
};
const eliminarCatalogo = async (id_catalogo) => {
  var eliminarCatalgo = await Catalogo.findByIdAndDelete(id_catalogo);
  return eliminarCatalgo;
};

async function consultarCatalogosIdUsuario(idUsuario) {
  try {
    var catalogosUsuarioBD = await Solicitudes.aggregate([
      {
        $lookup: {
          from: "bdfu_usuarios",
          localField: "usuario_id",
          foreignField: "_id",
          as: "UsuarioReportado",
        },
      },

      {
        $lookup: {
          from: "bdfc_tipoEstadoSolicitud",
          localField: "tipoEstadoSolicitud_id",
          foreignField: "_id",
          as: "TipoEstadoSolicitud",
        },
      },
      {
        $lookup: {
          from: "bdfc_catalogo",
          localField: "_id",
          foreignField: "solicitud",
          as: "Catalogo",
        },
      },

      {
        $lookup: {
          from: "bdfu_TipoCatalogo",
          localField: "Catalogo.tipo_catalogo",
          foreignField: "_id",
          as: "TipoCatalogo",
        },
      },
      {
        $lookup: {
          from: "bdfc_temas",
          localField: "Catalogo.tema_catalogo",
          foreignField: "_id",
          as: "TemaCatalogo",
        },
      },
      {
        $lookup: {
          from: "bdfc_pais",
          localField: "Catalogo.pais",
          foreignField: "_id",
          as: "PaisCatalogo",
        },
      },

      {
        $project: {
          _id: 0,
          IdUsuario: {
            $arrayElemAt: ["$UsuarioReportado._id", 0],
          },
          IdCatalogo: {
            $arrayElemAt: ["$Catalogo._id", 0],
          },
          NombreInternoCatalogo: "$catalogo_nombre_interno",
          EstadoCatalogo: {
            $arrayElemAt: ["$TipoEstadoSolicitud.name", 0],
          },

          TipoCatalogo: {
            $arrayElemAt: ["$TipoCatalogo.name", 0],
          },
          PaisCatalogo: {
            $arrayElemAt: ["$PaisCatalogo.name", 0],
          },
          Tema: {
            $arrayElemAt: ["$TemaCatalogo.name", 0],
          },
        },
      },
      {
        $match: {
          IdUsuario: ObjectId(idUsuario),
        },
      },

      // {
      //   $unwind: "$idUsuario"
      // }
    ]);

    return catalogosUsuarioBD;
  } catch (error) {
    console.log("Error en catch consultarCatalogosIdUsuario", error);
    return false;
  }
}

const buscarIdCatConIdTema = async (tema_catalogo) => {
 
  var catBD = await Catalogo.findOne( { tema_catalogo } , { _id:1 });
  if (catBD != null) {
    return catBD._id;
      
    }else{
      return "No existe catalogo con el tema proporcionado."
    }
};
const buscarIdCatConIdPais = async (pais) => {
 
  var catBD = await Catalogo.findOne( { pais } , { _id:1 });
  if (catBD != null) {
  return catBD._id;
    
  }else{
    return "No existe catalogo con el pais proporcionado."
  }

};

module.exports = {
  crearCatalogo,
  eliminarCatalogo,
  buscarIdCatConIdTema,
  buscarIdCatConIdPais
};
