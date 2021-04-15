const { response } = require("express");
const Mancolist = require("../../models/catalogo/manco_list");
const MancolistCat = require("../../models/catalogo/mancolista_categorizada.model");
const Usuario = require("../../models/usuario/usuario");
var mongo = require("mongoose");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");
const { ObjectId } = require("mongoose").Types;

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
    $and: [{ id_estampilla }, { id_mancolist_cat:id_manco_list }],
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
  } 
  else {
    
    if(mancoListBd == null) {
      const objetoMancolista = new Mancolist();

      objetoMancolista.id_usuario = id_usuario;
      objetoMancolista.id_estampilla = id_estampilla;
      objetoMancolista.id_mancolist_cat = id_manco_list;

      const guardado = await objetoMancolista.save();
      return res.json({
        ok: true,
        estampilla_agregada: guardado,
      });
    } 
    else {
      const eliminarMancolist = await Mancolist.findByIdAndDelete(mancoListBd._id);
      return res.json({
        ok: true,
        estampilla_eliminada: eliminarMancolist,
      });
    }
  }
};
const catMancolist=async(req, res)=>{
  try{
    const { name,uid,isdelete } = req.body;

    const token = req.header("x-access-token");

    const email = retornarDatosJWT(token);

    const { _id } = await Usuario.findOne({ email });

    const id_usuario = _id;


    const mancoListBd = await MancolistCat.findOne({
      $and: [{ id_usuario }, { _id:uid }],
    });

    //console.log("Buscar ->", mancoListBd);
    if (mancoListBd==null) {
      const guardado = await storeCatManco(id_usuario,name);
      return res.status(200).send({
        ok: true,
        data: guardado,
      });
    }
    else if(isdelete) {
      await MancolistCat.findByIdAndDelete({_id:uid});
      return res.status(200).send({
        ok: true,
        msg:"Eliminado"
      });
    }
    else{
      mancoListBd.name=name;
      await mancoListBd.save()
      return res.status(200).send({
        ok: true,
        msg:"Actualizado"
      });
    }
  }
  catch($e){
    return res.status(500).send({
      ok: true,
      msg:$e
    });
  }
}


const storeCatManco=async (id_usuario,name)=>{
  const objetoMancolista = new MancolistCat();
  objetoMancolista.id_usuario = id_usuario;
  if (!name || name == null) {
    objetoMancolista.name = "General";
  } else {
    objetoMancolista.name = name;
  }
  var save= await objetoMancolista.save();
  return save;
  
}

const getMancoListCat = async (req, res = response) => {
  try{
    const token = req.header("x-access-token");

    const email = retornarDatosJWT(token);
    if (email== null) throw {ok:false,msg:"not token"}
    const { _id } = await Usuario.findOne({ email });
    const obj = await MancolistCat.find({ id_usuario: _id});
    if(obj.length>0){
      return res.status(200).send({
        ok: true,
        data: obj,
        msg:"list ok"
      });
    }
    else{
      var saved=await storeCatManco(_id,"");
      if(!saved) throw {ok:false,msg:"not saved"}
      return res.status(200).send({
        ok: true,
        data: [saved],
        msg:"list ok"
      });
    }
  }
  catch($e){
    res.status(500).send($e)
  }
}

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
  
  var mancolista=await MancolistCat.findOne({_id:id},{name:1,id_usuario:1}).populate({
      path: "id_usuario",
      model: "Usuarios",
      select: {name:1,email:1,apellidos:1,temas:0,paises_coleccionados:0,tipo_catalogo:0}
  })
  const objMancoListBD = await Mancolist.aggregate([
    {
      $match:{id_mancolist_cat: ObjectId(id),}
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
      $project:{
        _id:1,
        estado_estampilla:1,
        id_estampilla:1,
        id_mancolist_cat:1,
        estampillas:{ $arrayElemAt: ["$estampillas", 0] },
      }
    },
    {
      $unwind:"$estampillas"
    },
    {
      $unwind:"$estampillas.Pais"
    },
    {
      $unwind:"$estampillas.Tema"
    },
    {
      $lookup: {
        from: "bdfc_pais",
        localField: "estampillas.Pais",
        foreignField: "_id",
        as: "pais",
      },
    },
    {
      $lookup: {
        from: "bdfc_temas",
        localField: "estampillas.Tema",
        foreignField: "_id",
        as: "tema",
      },
    },
    {
      $project:{
        _id:1,
        estado_estampilla:1,
        id_estampilla:1,
        id_mancolist_cat:1,
        estampillas:1,
        pais:{ $arrayElemAt: ["$pais", 0] },
        temas:{ $arrayElemAt: ["$tema", 0] },
      }
    },
  ]);
  try {
    if (objMancoListBD != null) {
      return res.json({
        ok: true,
        msg: objMancoListBD,
        mancolista:mancolista,
      });
    } else {
      return res.json({
        ok: true,
        msg: "Usuario aún sin mancolista",
      });
    }
  } catch (e) {
    return res.json({
      ok: false,
      msg: "Error, contacte al administrador",
      error: e,
    });
  }
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
    try{
      var {id}=req.query;
      const obj = await Mancolist.aggregate([
        {
          $match:{id_mancolist_cat: ObjectId(id),}
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
          $project:{
            _id:1,
            estado_estampilla:1,
            id_estampilla:1,
            id_mancolist_cat:1,
            estampillas:{ $arrayElemAt: ["$estampillas", 0] },
          }
        },
        {
          $unwind:"$estampillas"
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
          $project:{
            _id:1,
            estado_estampilla:1,
            id_estampilla:1,
            id_mancolist_cat:1,
            estampillas:1,
            "FOTO_ESTAMPILLAS":{$arrayElemAt: ["$photo", 0]}
          }
        },
      ]);
  
      return res.json({
        ok: true,
        msg: 'list ok',
        data: obj,
      });
    }
    catch($e){
      res.status(400).json({
        ok: false,
        msg:
          "Ha ocurrido un error de seguridad, no tienes los permisos necesacios.",
      });
    }
};

module.exports = {
  actualizarMancolist,
  compartirManco_list,
  verMancolistPropia,
  catMancolist,
  getMancoListCat,
  verMancolistCatId,
};
