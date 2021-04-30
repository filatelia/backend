const Categoria = require("../models/tienda/categoria.modelo");

const crearNuevaCategoria = async (nombre_categoria) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      tipo_error: null,
      msg: "Catagoría creada correctamente.",
    });

    var nuevaCategoria = new Categoria();
    nuevaCategoria.nombre_categoria = nombre_categoria;
    await nuevaCategoria.save();

    return objetoRespuesta;
  } catch (error) {
    console.log("Error en catch de crearNuevaCategoria | middlewares", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = error;
    objetoRespuesta.msg = "Error al crear categoría";
    return objetoRespuesta;
  }
};

const consultarTodasCategorias = async () => {
    try {
        var objetoRespuesta = new Object({
            ok: true,
            tipo_error: null,
            msg: null,
          });
        var categoriasBD = await Categoria.find();
        objetoRespuesta.msg = categoriasBD;
        return objetoRespuesta;
    } catch (error) {
        console.log("Error en catch de consultarTodasCategorias | middlewares categoria", error);
        objetoRespuesta.ok = false;
        objetoRespuesta.tipo_error = error;
        objetoRespuesta.msg = "Error al consultar todas categorias";
        return objetoRespuesta;
        
    }
}

const consultarCategoriaIdCategoria = async (id) => {
    try {
        var objetoRespuesta = new Object({
            ok: true,
            tipo_error: null,
            msg: null,
          });
        var categoriaBD = await Categoria.findById(id);
        if (categoriaBD == null) {
            objetoRespuesta.msg = "No se encontró categoria con el id proporcionado"
            return objetoRespuesta;
        }
        objetoRespuesta.msg = categoriaBD;
        return objetoRespuesta;
    } catch (error) {
        console.log("Error en catch de consultar categiria con id | middlewares categoria", error);
        objetoRespuesta.ok = false;
        objetoRespuesta.tipo_error = error;
        objetoRespuesta.msg = "Error al consultar categoria";
        return objetoRespuesta;
        
    }
}


module.exports = {
    crearNuevaCategoria,
    consultarTodasCategorias,
    consultarCategoriaIdCategoria
};
