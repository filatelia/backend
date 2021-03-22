const { response } = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../../models/usuario/usuario");
const {
  eliminarImagenServidor,
  crearImagen,
  retornarDatosJWT,
} = require("../../middlewares/index.middle");
const { isValidObjectId } = require("mongoose");

const getUsuario = async (req, res) => {
  const usuarios = await Usuario.find(
    { estado: true },
    "name  email roleuser imagenP telefono dir_linea1 dir_linea2 ciudad provincia pais codigopostal estado"
  );
  res.json({
    ok: true,
    usuarios,
  });
};

//Función para crear un usuario.

const createUsuario = async (req, res = response) => {
  const { email, password } = req.body;
  try {
    const usuario_ = new Usuario(req.body);

    const salt = bcrypt.genSaltSync();
    usuario_.password = bcrypt.hashSync(password, salt);
    usuario_.imagenP =
      "/imagenes/predeterminadas/" + usuario_.roleuser + ".png";
    console.log("antes de guardar: ", usuario_);
    // Guardar usuario
    await usuario_.save();

    res.json({
      ok: true,
      usuario_,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado... revisar logs",
    });
  }
};

const deleteUsuario = async (req, res = response) => {
  const uid = req.params.id;

  try {
    if (!isValidObjectId(uid)) {
      return res.json({
        ok: false,
        msg: "No has proporcionado un dato de usuario válido - notValidObjet",
      });
    }

    const usuario_ = await Usuario.findById(uid);
    if (!usuario_) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un usuario por ese id",
      });
    }

    //Eliminando fichero de imagen
    eliminarFichero();

    await Pais.findByIdAndDelete(uid);

    return res.json({
      ok: true,
      msg: "usuario eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
      error: e,
    });
  }
};

const updateUusuario = async (req, res = response) => {
  try {
    // Actualizaciones

    urlImagen = new Object();
    var {
      ...campos
    } = req.body;

    // Leer el Token
    const token = req.header("x-access-token");

    //Verificando si se desea actualizar imagen de usuario
    if (req.files) {
      //Verificando si existe sampleFile en la imagen enviada
      const { sampleFile } = req.files;
      if (sampleFile) {
        // Creando imagen

        urlImagen = crearImagen(req, "usuarios");

        if (urlImagen.url == "") {
          return res.json({
            ok: false,
            msg: urlImagen.error,
          });
        }
      } else {
        return res.json({
          ok: false,
          msg:
            "Para actualizar la imagen de un usuario debe enviarla con el name = 'sampleFile'.",
        });
      }
    }

    /**
     * Como sólo el usuario puede modificar su propio perfil,
     * desde el token extraemos su email
     */

    const emailByToken = retornarDatosJWT(token);
    const usuarioBdDesdeEmailToken = await Usuario.findOne({
      email: emailByToken,
    });



    console.log("codigo zip", campos.codigopostal);
    console.log("usuarioBdDesdeEmailToken ->", usuarioBdDesdeEmailToken);

    /**
     * Al evaluar urlImagen != ""
     * significa que el usuario envió una imagen para ser actualziada, sea la misma o no, se
     * actualizará, cambiando nombre en  la bd
     * por lo tanto, debemos borrar la basura en el servidor, para evitar futuros problemas.
     */
    if (urlImagen.url) {
      console.log("url != ''", urlImagen.url);
      //Antes de asignar la url nueva imagen que ya fue guardada sin ningún problema
      // debemos borrar la basura

      //Se debe evaluar si es la imagen predeterminada para no borrarla o si el
      //usuario en ese momento no tiene imagen, pues nunguna de las dos se puede borrar

      const urlImagenPredeterminada = "/imagenes/predeterminadas/";
      const urlImagenCliente = urlImagenPredeterminada + "cliente.png";
      const urlImagenAdmin = urlImagenPredeterminada + "admin.png";
      if (
        usuarioBdDesdeEmailToken.imagenP ||
        usuarioBdDesdeEmailToken.imagenP == urlImagenCliente ||
        usuarioBdDesdeEmailToken.imagenP == urlImagenAdmin
      ) {
        console.log("imagenP->", usuarioBdDesdeEmailToken.imagenP);
        eliminarImagenServidor(usuarioBdDesdeEmailToken.imagenP);
      }

      //Como sabemos que ya se borró, si sera necesario la imagen, ya asignamos la nueva imagen
      campos.imagenP = urlImagen.url;
    }
const uid = usuarioBdDesdeEmailToken._id;
    const usuarioActualizado = await Usuario.findByIdAndUpdate( uid, campos, 
      {
        new: true
      } );


  //  await usuarioBdDesdeEmailToken.save();
    return res.json({
      ok: true,
      msg: "Se ha actualizado el usuario correctamente",
      usuario_actualizado: usuarioActualizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
      error: error,
    });
  }
};

module.exports = {
  getUsuario,
  createUsuario,
  deleteUsuario,
  updateUusuario,
};
