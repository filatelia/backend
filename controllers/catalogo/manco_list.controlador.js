const { response } = require("express");
const Mancolist = require("../../models/catalogo/manco_list");
const MancolistCat = require("../../models/catalogo/mancolista_categorizada.model");
const Usuario = require("../../models/usuario/usuario");
var mongo = require("mongoose");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");

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
const createMancolist=async(req, res)=>{
  const { name,uid } = req.body;

  const token = req.header("x-access-token");

  const email = retornarDatosJWT(token);

  const { _id } = await Usuario.findOne({ email });

  const id_usuario = _id;
  console.log("id usuario", id_usuario);
  console.log("Name", name);

  const mancoListBd = await MancolistCat.findOne({
    $and: [{ id_usuario }, { _id:uid }, { name }],
  });

  //console.log("Buscar ->", mancoListBd);
  if (mancoListBd==null) {
    const guardado = await storeCatManco(id_usuario,name);
    return res.status(200).send({
      ok: true,
      data: guardado,
    });
  }
  else {
    // const eliminarMancolist = await MancolistCat.findByIdAndDelete(
    //   mancoListBd._id
    // );
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
  console.log("id", id);
  if (!mongo.isValidObjectId(id)) {
    return res.json({
      msg: "No existe mancolista con los datos proporcionados",
    });
  }

  const objMancoListBD = await Mancolist.find({ id_usuario: id });
  try {
    if (objMancoListBD != null) {
      return res.json({
        ok: true,
        msg: objMancoListBD,
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
    const obj = await Mancolist.find({
      $and: [
        {
          id_usuario: _id,
        },
        {
          name: "general",
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

module.exports = {
  actualizarMancolist,
  compartirManco_list,
  verMancolistPropia,
  createMancolist,
  getMancoListCat
};
