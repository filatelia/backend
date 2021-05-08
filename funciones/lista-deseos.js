const ListaDeseos = require("../models/tienda/lista-deseos.model");
const { ObjectId } = require("mongoose").Types;

async function agregarProductoListaDeseos(objetoDeseos) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      idListaDeseos: null,
      tipo_error: null,
    });

    var nuevoL = new ListaDeseos(objetoDeseos);
    var guar = await nuevoL.save();

    objetoRespuesta.msg = "Se ha guardado correctamente en lista de deseos";
    objetoRespuesta.idListaDeseos = guar._id;
    return objetoRespuesta;

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch agregarProductoListaDeseos " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch agregarProductoListaDeseos";
    return objetoRespuesta;
  }
}

async function removerProductoListaDeseos(_id) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      idListaDeseos: null,
      tipo_error: null,
    });

    var nuevoL = await ListaDeseos.findByIdAndRemove(_id);
   

    objetoRespuesta.msg = "Se ha eliminado correctamente en lista de deseos";
    objetoRespuesta.idListaDeseos = nuevoL._id;
    return objetoRespuesta;

    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch removerProductoListaDeseos " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch removerProductoListaDeseos";
    return objetoRespuesta;
  }
}

async function validarExistenciaEnListaDeseos(usuario, producto) {
 
 
 
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      existe: false,
      id: null, 
      tipo_error: null,
    });

    
 
  var lista = await ListaDeseos.aggregate(
    [

      {
        $match:
        {
          usuario: ObjectId(usuario),
          producto: ObjectId(producto)
        }
      }
      

    ]);


    if(lista.length == 0) {
      objetoRespuesta.existe = false;
    return objetoRespuesta;
    }
    objetoRespuesta.existe = true;
    objetoRespuesta.id = lista[0]._id;
    return objetoRespuesta;


    ///Cuando todo sale ok/////
  } catch (error) {
    console.log("Error en catch "+error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = ""+error;
    objetoRespuesta.msg = "Error en catch ";
return objetoRespuesta;
  }
 
 
 
 
 
 
 
 
 
 
}
async function listarTodosProductosListaDeseos(usuario) {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    return  await ListaDeseos.find( { usuario } );

  } catch (error) {
    console.log("Error en catch "+error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = ""+error;
    objetoRespuesta.msg = "Error en catch, ver tipo error ";

    return objetoRespuesta;
  }
 
  
  
}
module.exports = {
  agregarProductoListaDeseos,
  removerProductoListaDeseos,
  validarExistenciaEnListaDeseos,
  listarTodosProductosListaDeseos
};
