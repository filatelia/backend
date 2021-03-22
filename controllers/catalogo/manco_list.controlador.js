const { response } = require("express");
const Mancolist = require("../../models/catalogo/manco_list");
const Usuario = require("../../models/usuario/usuario");
var mongo = require("mongoose");
const { retornarDatosJWT } = require("../../middlewares/validar-jwt");

const actualizarMancolist = async (req, res = response) => {
  const { id_estampilla, estado_estampilla } = req.body;

  const token = req.header("x-access-token");

  const email = retornarDatosJWT(token);

  const { _id } = await Usuario.findOne({ email });

  const id_usuario = _id;
  console.log("id usuario", id_usuario);
  console.log("id estampilla", id_estampilla);

  const mancoListBd = await Mancolist.findOne({
    $and: [{ id_usuario }, { id_estampilla }],
  });

  //console.log("Buscar ->", mancoListBd);
if (estado_estampilla && mancoListBd != null) {
  
  mancoListBd.estado_estampilla = estado_estampilla;
 const estampillaActualizada = await mancoListBd.save();
  return res.json(
    {
      ok: true,
      mensaje: "Se ha actualizado el estado de la estampilla de la mancolista",
      estampilla: estampillaActualizada

    }
    );
  
} else {
  
  if (mancoListBd == null) {
    const objetoMancolista = new Mancolist();

    objetoMancolista.id_usuario = id_usuario;
    objetoMancolista.id_estampilla = id_estampilla;

    const guardado = await objetoMancolista.save();

    console.log("guardado", guardado);
  }else{
    const eliminarMancolist = await Mancolist.findByIdAndDelete(mancoListBd._id);
    console.log("Eliminado -->", eliminarMancolist);
  }
}


};

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
    const obj = await Mancolist.findOne({ id_usuario: _id });

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
};
