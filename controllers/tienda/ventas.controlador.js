const { response, json } = require("express");
const {
  crearDatosEnvio,
  mostrarDatosEnvioIdUsuario,
  crearNuevaVenta,
} = require("../../funciones/ventas");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../funciones/validar-campos");
const Color = require("colors");
const { listarProductosPorIdProducto } = require("../../funciones/tienda");
const crearVenta = async (req, res = response) => {
  function ExceptionUsuario(mensaje) {
    this.mensaje = mensaje;
    this.nombre = "ExceptionUsuario";
 }
 
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  const { comprador, productos } = req.body;
  console.log("productos", productos.length);
  if (!productos || !Array.isArray(productos) || productos.length == 0) {
    (objetoRespuesta.ok = false),
      (objetoRespuesta.msg = "Error en los datos recibidos.");
    objetoRespuesta.tipo_error =
      "Debes enviar un producto y debe ser un array.";

    return res.json(objetoRespuesta);
  }
  try {
    /////Consultando datos de envio////
    var datosEnvioBD = await mostrarDatosEnvioIdUsuario(comprador);
    if (!datosEnvioBD.ok) return res.json(datosEnvioBD);

    /// Consultando datos producto ///
    for (let index = 0; index < productos.length; index++) {
      const element = productos[index];

      var productoBD = await listarProductosPorIdProducto(element.producto);
      if (!productoBD.ok) {
        throw productoBD.msg;
        
      }
      var contadorTamanios= 0;

      productoBD.msg.tamanios.map((tamanios) => {

        if (tamanios._id == element.id_tamanio) {
          var contadorColor = 0;
          tamanios.colores.map((color) => {
            console.log("color.id", color.id);
            console.log("element.id_color", element.id_color);
            
            if (color.id == element.id_color) {
              if (element.cantidad > color.cantidad) {
                                 
                  throw  "La cantidad que deseas comprar excede el stock actual.";
                   
              }
            } else {
              contadorColor = contadorColor + 1;
            }
          });

          if (contadorColor == tamanios.length) {
            
           throw "El Color enviado no existe en tamaño proporcionado, actualiza la página por favor.";
          }
        }else{
          contadorTamanios =  contadorTamanios +1 ;

        }
        
      });

      if (contadorTamanios == productoBD.msg.tamanios.length) {
        throw "No existe el tamaño que asignaste al producto."
      }
    }

    //Asignando id datos de envío
    req.body.datos_envio = datosEnvioBD.datos_envio._id;

    var nuevaVenta = ""; //await crearNuevaVenta(req.body);

    return res.json(nuevaVenta);
  } catch (error) {
    console.log(
      Color.red(
        "Error en catch de controlador ventas -> crearVenta, descipción del error: " +
          error
      )
    );
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "Descripción del error : " + error;
    objetoRespuesta.msg = "Error al crear la venta.";

    return res.json(objetoRespuesta);
  }
};

const crearDatosEnvioCtr = async (req, res = response) => {
  console.log("Creando datos de envío");

  const {
    usuario,
    telefono,
    direccion_completa,
    otras_indicaciones,
  } = req.body;

  try {
    var arrayCamposValidar = [];
    var arrayIdsValidar = [];

    arrayCamposValidar.push(usuario);
    arrayCamposValidar.push(telefono);
    arrayCamposValidar.push(direccion_completa);
    arrayCamposValidar.push(otras_indicaciones);

    var validarCamposG = validarCamposGeneral(4, arrayCamposValidar);
    if (!validarCamposG)
      return res.json({ ok: false, msg: "Debes enviar los datos necesarios." });

    arrayIdsValidar.push(usuario);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar id usuario válido." });

    var datosEnvioCreados = await crearDatosEnvio(req.body);
    return res.json(datosEnvioCreados);
  } catch (error) {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });

    console.log("Error en catch crearDatosEnvioCtr " + error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch crearDatosEnvioCtr";

    return res.json(objetoRespuesta);
  }
};

const mostrarDatosEnvioCtr = async (req, res = response) => {
  try {
    var objetoRespuesta = new Object({
      ok: true,
      msg: null,
      tipo_error: null,
    });
    const { idDatosEnvio } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idDatosEnvio);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    var productosBD = await mostrarDatosEnvioIdUsuario(idDatosEnvio);

    return res.json(productosBD);
  } catch (error) {
    console.log("Error en catch mostrarDatosEnvioCtr", error);
    objetoRespuesta.ok = false;
    objetoRespuesta.tipo_error = "" + error;
    objetoRespuesta.msg = "Error en catch mostrarDatosEnvioCtr";
    return res.json(objetoRespuesta);
  }
};
module.exports = {
  crearVenta,
  crearDatosEnvioCtr,
  mostrarDatosEnvioCtr,
};
