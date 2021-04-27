const { response } = require("express");
const Mancolist = require("../../models/catalogo/manco_list");
const MancolistCat = require("../../models/catalogo/mancolista_categorizada.model");
const Usuario = require("../../models/usuario/usuario");
const TipoEstadoEsperadoEstampilla = require("../../models/catalogo/tipoEsperadoEstampilla.model");
var mongo = require("mongoose");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const { consultarDatosConCorreo } = require("../../middlewares/usuario");
const funcionesValidaciones = require("../../middlewares/validar-campos"); 

const { ObjectId } = require("mongoose").Types;
const { isValidObjectId } = require("mongoose");
const estampillasModelo = require("../../models/catalogo/estampillas.modelo");

const actualizarMancolist = async (req, res = response) => {
  const { id_estampilla, estado_estampilla, id_manco_list } = req.body;

  const token = req.header("x-access-token");

  const email = retornarDatosJWT(token);

  const { _id } = await Usuario.findOne({ email });

  const id_usuario = _id;
  console.log("id usuario", id_usuario);
  console.log("id estampilla", id_estampilla);
  console.log("id id_manco_list", id_manco_list);

  const mancoListBd = await Mancolist.findOne({
    $and: [{ id_estampilla }, { id_mancolist_cat: id_manco_list }],
  });

  //console.log("Buscar ->", mancoListBd);
  if (estado_estampilla && mancoListBd != null) {
    mancoListBd.estado_estampilla = estado_estampilla;
    const estampillaActualizada = await mancoListBd.save();
    return res.json({
      ok: true,
      mensaje: "Se ha actualizado el estado de la estampilla de la mancolista",
      estampilla: estampillaActualizada,
    });
  } else {
    if (mancoListBd == null) {
      const objetoMancolista = new Mancolist();

      objetoMancolista.id_usuario = id_usuario;
      objetoMancolista.id_estampilla = id_estampilla;
      objetoMancolista.id_mancolist_cat = id_manco_list;

      const guardado = await objetoMancolista.save();
      return res.json({
        ok: true,
        estampilla_agregada: guardado,
      });
    } else {
      const eliminarMancolist = await Mancolist.findByIdAndDelete(
        mancoListBd._id
      );
      return res.json({
        ok: true,
        estampilla_eliminada: eliminarMancolist,
      });
    }
  }
};
const catMancolist = async (req, res) => {
  try {
    const { name, uid, isdelete } = req.body;

    const token = req.header("x-access-token");

    const email = retornarDatosJWT(token);

    const { _id } = await Usuario.findOne({ email });

    const id_usuario = _id;

    const mancoListBd = await MancolistCat.findOne({
      $and: [{ id_usuario }, { _id: uid }],
    });

    //console.log("Buscar ->", mancoListBd);
    if (mancoListBd == null) {
      const guardado = await storeCatManco(id_usuario, name);
      return res.status(200).send({
        ok: true,
        data: guardado,
      });
    } else if (isdelete) {
      await MancolistCat.findByIdAndDelete({ _id: uid });
      return res.status(200).send({
        ok: true,
        msg: "Eliminado",
      });
    } else {
      mancoListBd.name = name;
      await mancoListBd.save();
      return res.status(200).send({
        ok: true,
        msg: "Actualizado",
      });
    }
  } catch ($e) {
    return res.status(500).send({
      ok: true,
      msg: $e,
    });
  }
};

const storeCatManco = async (id_usuario, name) => {
  const objetoMancolista = new MancolistCat();
  objetoMancolista.id_usuario = id_usuario;
  if (!name || name == null) {
    objetoMancolista.name = "General";
  } else {
    objetoMancolista.name = name;
  }
  var save = await objetoMancolista.save();
  return save;
};

const getMancoListCat = async (req, res = response) => {
  try {
    const token = req.header("x-access-token");

    const email = retornarDatosJWT(token);
    if (email == null) throw { ok: false, msg: "not token" };
    const { _id } = await Usuario.findOne({ email });
    const obj = await MancolistCat.find({ id_usuario: _id });
    if (obj.length > 0) {
      return res.status(200).send({
        ok: true,
        data: obj,
        msg: "list ok",
      });
    } else {
      var saved = await storeCatManco(_id, "");
      if (!saved) throw { ok: false, msg: "not saved" };
      return res.status(200).send({
        ok: true,
        data: [saved],
        msg: "list ok",
      });
    }
  } catch ($e) {
    res.status(500).send($e);
  }
};

/*
Se comparte mancolista sólo con el id de usuario, haciendo que la mancolista sea 
de nivel publico, no es necesario tener una cuenta para poder verla
*/
const compartirManco_list = async (req, res = response) => {
  const { id } = req.params;

  if (!mongo.isValidObjectId(id)) {
    return res.json({
      msg: "No existe mancolista con los datos proporcionados",
    });
  }

  var mancolistasBD = await Mancolist.aggregate(
    [
      {
        $lookup:
        {
          from: "bdfc_estampillas",
          localField: "id_estampilla",
          foreignField: "_id",
          as:"EstampillasEnMancolista"
        }
      },
      {
        $lookup:
        {
          from: "bdfc_variantes_errores",
          localField: "EstampillasEnMancolista.VARIANTES_ERRORES",
          foreignField: "_id",
          as:"Variantes_erroresEstampilla"
        }
      },
      {
        $lookup:{
          from: "bdfc_uploads_imagenes",
          localField: "EstampillasEnMancolista.FOTO_ESTAMPILLAS",
          foreignField: "_id",
          as:"ImagenesEstampilla"
       
        }
      },
      {
        $project:{
          idEstampilla:  { 
            $arrayElemAt: ["$EstampillasEnMancolista._id", 0]
          }, 
          idCategoriaEstampilla: "$id_mancolist_cat",
          FotoEstampilla: { 
            $arrayElemAt: ["$ImagenesEstampilla", 0]
          },
          InformacionEstampilla:  { 
            $arrayElemAt: ["$EstampillasEnMancolista", 0]
          },
          VariantesErroresEstampilla: "$Variantes_erroresEstampilla"

        }

      },
      {
        $match:{
          idCategoriaEstampilla: ObjectId(id)
        }
      }
     
      
    ])

    var usuarioPro = await MancolistCat.findById(id);
    console.log(usuarioPro);
    var objetoUsuario = new Object(
      {
        nombreCompleto: usuarioPro.id_usuario.name+" "+ usuarioPro.id_usuario.apellidos,
        correoElectronico: usuarioPro.id_usuario.email,
        reputacion: usuarioPro.id_usuario.reputacion,
        apodo:  usuarioPro.id_usuario.nickname
      })

  return res.json({ok:true, usuarioPropietario:objetoUsuario, mancolista: mancolistasBD})
};

/*
 */
const verMancolistPropia = async (req, res = response) => {
  const token = req.header("x-access-token");

  const email = retornarDatosJWT(token);
  if (email != null) {
    console.log("retornar datos token", email);

    const { _id } = await Usuario.findOne({ email });
    const obj = await MancolistCat.find({
      $and: [
        {
          id_usuario: _id,
        },
      ],
    });

    return res.json({
      ok: true,
      msg: obj,
    });
  } else {
    res.status(400).json({
      ok: false,
      msg:
        "Ha ocurrido un error de seguridad, no tienes los permisos necesacios.",
    });
  }
};
const verMancolistCatId = async (req, res = response) => {
  try {
    var objConsulta = [];
    var { id } = req.query;
    const obj = await Mancolist.aggregate([
      {
        $match: { id_mancolist_cat: ObjectId(id) },
      },
      {
        $lookup: {
          from: "bdfc_estampillas",
          localField: "id_estampilla",
          foreignField: "_id",
          as: "estampillas",
        },
      },
      {
        $project: {
          _id: 1,
          estado_estampilla: 1,
          id_estampilla: 1,
          id_mancolist_cat: 1,
          estampillas: { $arrayElemAt: ["$estampillas", 0] },
        },
      },
      {
        $unwind: "$estampillas",
      },
      // {
      //   $unwind:"$estampillas.Pais"
      // },
      // {
      //   $unwind:"$estampillas.Tema"
      // },
      {
        $lookup: {
          from: "bdfc_uploads_imagenes",
          localField: "estampillas.FOTO_ESTAMPILLAS",
          foreignField: "_id",
          as: "photo",
        },
      },
      // {
      //   $lookup: {
      //     from: "bdfc_temas",
      //     localField: "estampillas.Tema",
      //     foreignField: "_id",
      //     as: "tema",
      //   },
      // },
      {
        $project: {
          _id: 1,
          estado_estampilla: 1,
          id_estampilla: 1,
          id_mancolist_cat: 1,
          estampillas: 1,
          FOTO_ESTAMPILLAS: { $arrayElemAt: ["$photo", 0] },
        },
      },
    ]);
    console.log("obj ->", obj);

    return res.json({
      ok: true,
      msg: "list ok",
      data: obj,
    });
  } catch ($e) {
    res.status(400).json({
      ok: false,
      msg:
        "Ha ocurrido un error de seguridad, no tienes los permisos necesacios.",
    });
  }
};
const validarMancolist = async (req, res) => {
  var { id_categoria_estampilla, id_estampilla } = req.body;

  if (
    !id_categoria_estampilla ||
    id_categoria_estampilla === "" ||
    id_categoria_estampilla === null ||
    !id_estampilla ||
    id_estampilla === "" ||
    id_estampilla === null
  ) {
    return res.json({
      ok: false,
      msg: "No estas enviando los datos obligatorios",
    });
  }
  if (!mongo.isValidObjectId(id_categoria_estampilla)) {
    return res.json({
      ok: false,
      msg: "No estas enviando ids válidos",
    });
  }

  // Leer el Token
  const token = req.header("x-access-token");
  const email = retornarDatosJWT(token);

  var usuarioBD = await consultarDatosConCorreo(email);
  var id_usuario = usuarioBD._id;

  //Validando si es toda una serie que se desea evaluar
  if (Array.isArray(id_estampilla)) {
    console.log("Toda la serie");

    var contador = 0;
    for (let index = 0; index < id_estampilla.length; index++) {
      const element = id_estampilla[index];
      if (!mongo.isValidObjectId(element)) {
        return res.json({
          ok: false,
          msg: "No estas enviando ids válidos",
        });
      }

      var mancolistaEnBD = await Mancolist.aggregate([
        {
          $lookup: {
            from: "bdfc_manco_list_cat",
            localField: "id_mancolist_cat",
            foreignField: "_id",
            as: "categoria_mancolista",
          },
        },
        {
          $unwind: "$categoria_mancolista",
        },
        {
          $project: {
            id_usuario: "$categoria_mancolista.id_usuario",
            id_categoria_estampilla: "$categoria_mancolista._id",
            id_estampilla: 1,
          },
        },
        {
          $match: {
            id_usuario: ObjectId(id_usuario),
            id_categoria_estampilla: ObjectId(id_categoria_estampilla),
            id_estampilla: ObjectId(element),
          },
        },
      ]);

      if (mancolistaEnBD.length > 0) {
        contador = contador + 1;
      }
    }

    if (contador === id_estampilla.length) {
      return res.json({
        ok: false,
        existe: true,
      });
    } else {
      return res.json({
        ok: true,
        existe: false,
      });
    }
  } else {
    console.log(id_estampilla);
    if (!mongo.isValidObjectId(id_estampilla)) {
      return res.json({
        ok: false,
        msg: "No estas enviando ids válidos",
      });
    }

    var mancolistaEnBD = await Mancolist.aggregate([
      {
        $lookup: {
          from: "bdfc_manco_list_cat",
          localField: "id_mancolist_cat",
          foreignField: "_id",
          as: "categoria_mancolista",
        },
      },
      {
        $unwind: "$categoria_mancolista",
      },
      {
        $project: {
          id_usuario: "$categoria_mancolista.id_usuario",
          id_categoria_estampilla: "$categoria_mancolista._id",
          id_estampilla: 1,
        },
      },
      {
        $match: {
          id_usuario: ObjectId(id_usuario),
          id_categoria_estampilla: ObjectId(id_categoria_estampilla),
          id_estampilla: ObjectId(id_estampilla),
        },
      },
    ]);
    console.log(mancolistaEnBD);
    if (mancolistaEnBD.length > 0) {
      return res.json({
        ok: false,
        existe: true,
      });
    } else {
      return res.json({
        ok: true,
        existe: false,
      });
    }
  }
};
const agregarSerieMancolista = async (req, res) => {
  const { ids_estampillas, id_mancolist_cat, id_catalogo } = req.body;
  var aAgregar = [];

  //Validando si envia el id catálogo
  if(id_catalogo && isValidObjectId(id_catalogo)){

    var estampillasIDCatalogo = await estampillasModelo.find( {CATALOGO:id_catalogo } );
    for (let index = 0; index < estampillasIDCatalogo.length; index++) {
      const element = estampillasIDCatalogo[index];
      
  
       var estampillaEnMancolista = await Mancolist.aggregate([
            { 
              $lookup:
              {
                from: "bdfc_manco_list_cat",
                localField: "id_mancolist_cat",
                foreignField: "_id",
                as: "MancolistaCategorizada"
              }
            },
            {
              $project: 
              {
                IdEstampilla: "$id_estampilla",
                IdCategoriaMancolista: "$id_mancolist_cat",
                NombreCategoriaMancolista: 
                {
                  $arrayElemAt: ["$MancolistaCategorizada.name", 0]

                }

              }
            },
            {
              $match: 
              {
                IdCategoriaMancolista: ObjectId(id_mancolist_cat),
                IdEstampilla: ObjectId(element._id)

              }
            }
          ]);
                 
          if(estampillaEnMancolista.length == 0){
            var objMancolista = new Object();
            objMancolista.id_mancolist_cat = id_mancolist_cat;
            objMancolista.id_estampilla = element._id;
            aAgregar.push(objMancolista);

          }
      }
  }else{
    
  console.log("aAgregar inicial", aAgregar);
  for (let index = 0; index < ids_estampillas.length; index++) {
    const element = ids_estampillas[index];

    var objMancolista = new Object();

    objMancolista.id_mancolist_cat = id_mancolist_cat;

    var mancolistaEnBD = await Mancolist.findOne({
      id_estampilla: element,
      id_mancolist_cat,
    });
    console.log("Resultado bd", mancolistaEnBD);
    if (mancolistaEnBD == null) {
      objMancolista.id_estampilla = element;

      aAgregar.push(objMancolista);
    }
  }

  }




  console.log("aAgregar", aAgregar);
  if (aAgregar.length > 0) {
    await Mancolist.insertMany(aAgregar);
  }

  return res.json({
    ok: true,
    msg: aAgregar,
  });
};

const listarTiposEspearadosEstampillas = async (req, res = response) => {
  try {
    var tiposEspearadosEstampillasBD = await TipoEstadoEsperadoEstampilla.find(
      {},
      { __v: 0 }
    );

    return res.json({
      ok: true,
      msg: tiposEspearadosEstampillasBD,
    });
  } catch (error) {
    console.log(
      "Error en catch de listarTiposEspearadosEstampillas controlador ->",
      error
    );
    return res.json({
      ok: false,
      msg: "Error al consultar en la base de datos.",
    });
  }
};
const eliminadoMuchasEstampillasMancolista = async (req, res) => {
  console.log("Eliminando array de estampillas de manclista...");

  const { arrayIdEstampillas, idCategoriaEstampilla } = req.body;
  var estampillasEliminadasDeMancolista = await Mancolist.deleteMany(
    {
      $and: 
      [
        {
          _id:arrayIdEstampillas
        },
        {
          id_mancolist_cat:idCategoriaEstampilla
        }

      ]
    
      
     }); 

     console.log("estampillasEliminadasDeMancolista", estampillasEliminadasDeMancolista);

}

const paginacionMancolistas = async (req, res = response, next) => {
  var {idCategoriaMancolista} = req.query;
  var array = [];
  var pagina = req.query.pagina || 1;
  var porPagina = req.query.porPagina || 5;
  porPagina= parseInt(porPagina);
  pagina = pagina -1;
  array.push(idCategoriaMancolista);

  var valida = funcionesValidaciones.validarCamposGeneral(1, array);
  if(valida != true){
    return res.json({
      ok: false,
      msg: "Debes enviar un id categoria."
    })
  }
  var calidaObjetId = funcionesValidaciones.isValidObjectIdGeneral(1, array);
  if(calidaObjetId != true){
    return res.json({
      ok: false,
      msg: "Debes enviar un id categoria válido."
    })
  }
  var totalRegistros = await Mancolist.aggregate(
    [
      {
        $lookup: 
        {
          from: "bdfc_estampillas",
          localField: "id_estampilla",
          foreignField: "_id",
          as: "EstampillasBD"

        }
      },
      {
        $lookup: 
        {
          from: "bdfc_manco_list_cat",
          localField: "id_mancolist_cat",
          foreignField: "_id",
          as: "CategoriasMancolista"

        }
      },
      {
        $project: {
          IdCategoriaMancolistas: "$id_mancolist_cat",
          NombreCategoriaMancolista: 
          {
            $arrayElemAt: ["$CategoriasMancolista.name", 0]
          },
          Estampillas: 
          {
            $arrayElemAt: ["$EstampillasBD", 0]
          }

        }
      },
      {
        $unwind: "$Estampillas"
      },
      {
        $match: 
        {
          IdCategoriaMancolistas: ObjectId(idCategoriaMancolista)
        }
      }

    ]
    );
    var total = totalRegistros.length;
  var estampillasCategoriaMancolista = await Mancolist.aggregate(
    [
      {
        $lookup: 
        {
          from: "bdfc_estampillas",
          localField: "id_estampilla",
          foreignField: "_id",
          as: "EstampillasBD"

        }
      },
      {
        $lookup: 
        {
          from: "bdfc_manco_list_cat",
          localField: "id_mancolist_cat",
          foreignField: "_id",
          as: "CategoriasMancolista"

        }
      },
      {
        $lookup: 
        {
          from: "bdfc_uploads_imagenes",
          localField: "EstampillasBD.FOTO_ESTAMPILLAS",
          foreignField: "_id",
          as: "ImagenEstampilla"

        }
      },
    
      {
        $project: {
          UrlImagenEstampilla: 
          {
            $arrayElemAt: ["$ImagenEstampilla.imagen_url", 0]
          },
          IdCategoriaMancolistas: "$id_mancolist_cat",
          NombreCategoriaMancolista: 
          {
            $arrayElemAt: ["$CategoriasMancolista.name", 0]
          },
          EstadoESperadoEstampilla: "$estado_estampilla",
          Estampillas: 
          {
            $arrayElemAt: ["$EstampillasBD", 0]
          }

        }
      },
      {
        $unwind: "$Estampillas"
      },
      {
        $match: 
        {
          IdCategoriaMancolistas: ObjectId(idCategoriaMancolista)
        }
      }

    ]
    ).skip((porPagina*pagina))
    .limit(porPagina);

    console.log("estampillasCategoriaMancolista", estampillasCategoriaMancolista);


    var totalListados = estampillasCategoriaMancolista.length;
    console.log("total", total);
    console.log("total listados", totalListados);

    return res.json({
      ok: true,
      totalPaginasDisponibles: Math.ceil(total/porPagina),
      totalEstampillasDisponibles: total,
      paginaListada: (pagina + 1 ),
      estampillasPorPaginaSolicitado: porPagina,
      totalEstampillasEnviados: totalListados,
      estampillas: estampillasCategoriaMancolista



    })


        



}

module.exports = {
  actualizarMancolist,
  compartirManco_list,
  verMancolistPropia,
  catMancolist,
  getMancoListCat,
  verMancolistCatId,
  validarMancolist,
  agregarSerieMancolista,
  listarTiposEspearadosEstampillas,
  eliminadoMuchasEstampillasMancolista,
  paginacionMancolistas
};
