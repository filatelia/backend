const { response } = require("express");
const {
  guardarImagenVariantesErrores,
} = require("../../controllers/catalogo/uploads.controlador");
const Variantes = require("../../models/catalogo/variantes-errores.modelo");
const Estampillas = require("../../models/catalogo/estampillas.modelo");

const crearVariantesYErrores = async (req, res = response) => {
  try {
    const { id_estampilla } = req.body;
    console.log(req.files);
    const urlImagenVariantes = await guardarImagenVariantesErrores(req);

    if (urlImagenVariantes == null) {
      return res.json({
        ok: false,
        msg: "Error al guardar la imagen en el servidor",
      });
    }
    console.log("imagen guardada", urlImagenVariantes);

    var objVariantes = new Variantes(req.body);
    objVariantes.Imagen_variantes_errores = urlImagenVariantes;

    const varianteGuardada = await objVariantes.save();

    await agregarVariantesErroresEstampilla(
      id_estampilla,
      varianteGuardada._id
    );

    return res.json({
      ok: true,
      msg: varianteGuardada,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "error fatal | crearVariantesYErrores",
      error: error,
    });
  }
};

async function agregarVariantesErroresEstampilla(id_estampilla, id_variantes) {
 try {
   
   var variantesBD = await Estampillas.findById(id_estampilla);
 
   variantesBD.VARIANTES_ERRORES.push(id_variantes);
   const estampillaModificada = await variantesBD.save();
   return estampillaModificada;
 } catch (error) {
   console.log("Error agregarVariantesErroresEstampilla", error);
   return null;
 }
}

module.exports = {
  crearVariantesYErrores,
  agregarVariantesErroresEstampilla
};
