const { response } = require("express");
const { agregarProductoListaDeseos,
    removerProductoListaDeseos,
    validarExistenciaEnListaDeseos,
    listarTodosProductosListaDeseos  } = require("../../funciones/lista-deseos");
const { consultarDatosConId } = require("../../funciones/usuario");
const { isValidObjectIdGeneral, validarCamposGeneral } = require("../../funciones/validar-campos");
const { listarProductosPorIdProducto } = require("../../funciones/tienda"); 
const { retornarIdClienteConJWT } = require("../../funciones/validar-jwt");


const agregarProductoListaDeseosCtr = async (req, res= response) => {

    try {
        var objetoRespuesta = new Object({
          ok: true,
          msg: null,
          tipo_error: null,
        });
       
        console.log("⚫ Agregando producto a lista de deseos.");
    
        const { usuario, producto } = req.body;

        var arrayCamposValidar = [];
        var arrayIdsValidar = [];
    
        arrayCamposValidar.push(usuario);
        arrayCamposValidar.push(producto);
    
        var validarCamposG = validarCamposGeneral(2, arrayCamposValidar);
        if(!validarCamposG) return res.json({ok:false, msg: "Debes enviar los datos necesarios."});
    
        arrayIdsValidar.push(usuario);
        arrayIdsValidar.push(producto);
        var validarIds= isValidObjectIdGeneral(2, arrayIdsValidar);
        if(!validarIds) return res.json({ok:false, msg: "Debes enviar ids válidos."});

        ///////VALIDANDO VERACIDAD DE LOS IDS //////

        //Verificando que el id sea de un usuario
        var existeUsuario = await consultarDatosConId(usuario);
        if(!existeUsuario) {
            objetoRespuesta.ok = false;
            objetoRespuesta.msg = "El id que enviaste no corresponde a un usuario.";
            objetoRespuesta.tipo_error = "Usuario no encontrado.";

            return res.json(objetoRespuesta);
        }

        ///Verificando existencia de producto///
        var productoExiste = await listarProductosPorIdProducto(producto);
        if (!productoExiste.ok) return res.json(productoExiste);
    
        var guardarEnListaDeseos = await agregarProductoListaDeseos(req.body);
    
        
        console.log("guardarEnListaDeseos", guardarEnListaDeseos);
        return res.json(guardarEnListaDeseos);
    
        ///Cuando todo sale ok/////
      } catch (error) {
        console.log("Error en catch agregarProductoListaDeseosCtr "+error);
        objetoRespuesta.ok = false;
        objetoRespuesta.tipo_error = ""+error;
        objetoRespuesta.msg = "Error en catch agregarProductoListaDeseosCtr.";
        
        return res.json(objetoRespuesta);
      }

}

const removerProductoListaDeseostr = async (req, res= response) => {

    try {
        var objetoRespuesta = new Object({
          ok: true,
          msg: null,
          tipo_error: null,
        });
       
        console.log("⚫ Agregando producto a lista de deseos.");
    
        const {idListaDeseos } = req.params;

        var arrayCamposValidar = [];
        var arrayIdsValidar = [];
    
        arrayCamposValidar.push(idListaDeseos);

    
        var validarCamposG = validarCamposGeneral(1, arrayCamposValidar);
        if(!validarCamposG) return res.json({ok:false, msg: "Debes enviar los datos necesarios."});
    
        arrayIdsValidar.push(idListaDeseos);

        var validarIds= isValidObjectIdGeneral(1, arrayIdsValidar);
        if(!validarIds) return res.json({ok:false, msg: "Debes enviar id válido."});



    
        var guardarEnListaDeseos = await removerProductoListaDeseos(idListaDeseos);
    
        
        console.log("guardarEnListaDeseos", guardarEnListaDeseos);
        return res.json(guardarEnListaDeseos);
    
        ///Cuando todo sale ok/////
      } catch (error) {
        console.log("Error en catch agregarProductoListaDeseosCtr "+error);
        objetoRespuesta.ok = false;
        objetoRespuesta.tipo_error = ""+error;
        objetoRespuesta.msg = "Error en catch agregarProductoListaDeseosCtr.";
        
        return res.json(objetoRespuesta);
      }

}
const VerificarEnListaDeseosCtr = async(req, res = response) => {
console.log("Asdasdasd");
const { idusuario, idproducto } = req.query;
   var existeEnLista = await validarExistenciaEnListaDeseos(idusuario, idproducto); 
   console.log("existeEnLista", existeEnLista);
}
const listarTodosProductosListaDeseosCtr= async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
      lista: null
    });

    console.log("Listando todos los productos lista deseos");

    var token = req.header("x-access-token");

    if (!token) {

      throw "No existe token en la petición."
    }
    var usuario =retornarIdClienteConJWT(token);
    var listaFavoritos =  await listarTodosProductosListaDeseos(usuario); 
    objetoRespuesta.msg= "Se ha consulltado correctamente";
    objetoRespuesta.lista = listaFavoritos;

    return res.json(objetoRespuesta);

  


  } catch (error) {
    console.log("Error en catch listarTodosProductosListaDeseosCtr "+error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = ""+error;
    objetoRespuesta.msg = "Error en catch ";
 
    return res.json(objetoRespuesta);

  }
}

module.exports = {
    agregarProductoListaDeseosCtr,
    removerProductoListaDeseostr,
    VerificarEnListaDeseosCtr,
    listarTodosProductosListaDeseosCtr
}