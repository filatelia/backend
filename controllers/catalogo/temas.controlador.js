const { response } = require("express");
const { buscarTema } = require("../../middlewares/temas");
const Tema = require("../../models/catalogo/temas");
const Catalogo = require("../../models/catalogo/catalogo");
const { buscarSolicitudIdTema } = require("../../middlewares/solicitudes");

const getTemas = async (req, res) => {
  var temas = [];
  var respuesta = await Catalogo.find({},{solicitudes:1});
   
  respuesta.map((data) => {
      if (data.tema_catalogo && data.solicitud.tipoEstadoSolicitud_id.abreviacion === "ACE2") {
        temas.push(data.tema_catalogo);
      }
    });
    

 return res.json({
    ok: true,
    temas: temas,
  });
};
const getTema = async (req, res) => {
  try {
    var { tema } = req.params;
    const temas = await Tema.findOne({ ParaBuscar: tema });
    res.json({
      ok: true,
      data: temas,
    });
  } catch ($e) {
    res.status(400).send({
      ok: false,
      msg: $e,
    });
  }
};

const createTema = async (name) => {
  try {
    const existetema = await Tema.findOne({ name });
    if (existetema) {
      return "tema ya existe";
    }
    const tema_ = new Tema(req.body);
    // Guardar usuario
    const tema_nuevo = await tema_.save();
    return tema_nuevo;
  } catch (error) {
    return console.log(error);
  }
};

const deleteTema = async (req, res = response) => {
  const uid = req.params.id;

  try {
    const tema_ = await Tema.findById(uid);
    if (!tema_) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un tema por ese id",
      });
    }

    const temaActualizado = await Tema.findByIdAndUpdate(
      uid,
      { estado: false },
      { new: true }
    );

    //await Pais.findByIdAndDelete( uid );

    res.json({
      ok: true,
      msg: "Tema eliminado",
      pais: temaActualizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const updateTema = async (req, res = response) => {
  const uid = req.params.id;

  try {
    const tema_ = await Tema.findById(uid);

    if (!tema_) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un Tema por ese id",
      });
    }
    // Actualizaciones
    const { name, ...campos } = req.body;

    if (tema_.name !== name) {
      const existeTema = await Tema.findOne({ name });
      if (existeTema) {
        return res.status(400).json({
          ok: false,
          msg: "ya existe un Tema con ese nombre",
        });
      }
    }

    const TemaActualizado = await Tema.findByIdAndUpdate(uid, campos, {
      new: true,
    });

    res.json({
      ok: true,
      anio: TemaActualizado,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado",
    });
  }
};

const validarDatosRecibidosMostrarDatosDuenio = async (
  req,
  res = response,
  next
) => {
  const { nombre_tema } = req.params;

  if (!nombre_tema || nombre_tema == null || nombre_tema == "") {
    return res.json({
      ok: false,
      msg: "Debes enviar un nombre de tema",
    });
  }
  //buscando existencia de tema
  const existeTema = await buscarTema(nombre_tema);
  try {
    //validando si no existe tema para retornar ok
    //si existe se retorna toda la información del cliente dueño
    if (existeTema == null) {
      return res.json({
        ok: true,
        msg: true,
      });
    } else {
      next();
    }
  } catch (e) {
    return res.json({
      ok: false,
      msg:
        "ha ocurrido un error fatal, validarDatosRecibidosMostrarDatosDuenio",
      error: e,
    });
  }
};

const mostrarDatosDuenio = async (req, res) => {
  try {
    const { nombre_tema } = req.params;
    const existeTema = await buscarTema(nombre_tema);

    var datosBD = await buscarSolicitudIdTema(existeTema._id);
    datosBD = datosBD.usuario_id;
    if (!datosBD.apellidos) {
      datosBD.apellidos = "";
    }

    var datosDuenio = new Object();
    datosDuenio.nombre_completo =
      datosBD.name + " " + datosBD.apellidos || "aa";
    datosDuenio.correo = datosBD.email;
    datosDuenio.telefono = datosBD.telefono;
    datosDuenio.apodo = datosBD.nickname;

    return res.json({
      ok: true,
      msg: datosDuenio,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Ha ocurrido un error faltal | mostrarDatosDuenio ",
      error: error,
    });
  }
};

module.exports = {
  getTemas,
  getTema,
  createTema,
  deleteTema,
  updateTema,
  mostrarDatosDuenio,
  validarDatosRecibidosMostrarDatosDuenio,
};
