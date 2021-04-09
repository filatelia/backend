const { response } = require("express");
const { buscarTema } = require("../../middlewares/temas");
const Tema = require("../../models/catalogo/temas");
const { buscarSolicitudIdTema } = require("../../middlewares/solicitudes");

const getTemas = async (req, res) => {
  const temas = await Tema.find();
  res.json({
    ok: true,
    temas,
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
const validarDatosRecibidosMostrarDatosDuenio = async (req, res = response) => {
  const { nombre_tema } = req.body;

  //buscando existencia de tema
  const existeTema = await buscarTema(nombre_tema);
try {
    //validando si no existe tema para retornar ok
    //si existe se retorna toda la información del cliente dueño
    if (existeTema != null) {
      return res.json({
        ok: true,
        msg: "No existe tema, puede crearlo",
      });
    }
  
    var solicitudBd = await buscarSolicitudIdTema(existeTema._id);
    return res.json({
        ok: false,
        msg: solicitudBd
    });

} catch (e) {
    return res.json({
        ok: "error",
        msg: "ha ocurrido un error fatal, validarDatosRecibidosMostrarDatosDuenio",
        error: e
    });

}
};

const mostrarDatosDuenio = async () => {};

module.exports = {
  getTemas,
  getTema,
  createTema,
  deleteTema,
  updateTema,
  mostrarDatosDuenio,
  validarDatosRecibidosMostrarDatosDuenio,
};
