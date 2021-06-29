const { response, json } = require("express");
const {
  crearDatosEnvio,
  mostrarDatosEnvioIdUsuario,
  crearNuevaVenta,
  restarProductosVendidos,
} = require("../../funciones/ventas");
const {
  validarCamposGeneral,
  isValidObjectIdGeneral,
} = require("../../funciones/validar-campos");
const Color = require("colors");
const { listarProductosPorIdProducto } = require("../../funciones/tienda");
const {
  crearPago,
  consultarConvertirMonedaTiempoReal,
  configurarPaypal,
  generarTokenPaypal,
  crearPagoPaypal
} = require("../../funciones/paypal");
const { retornarIdClienteConJWT } = require("../../funciones/validar-jwt");
const CuentaPaypal = require("../../models/pagos/cuentaPaypal");
const request = require("request");
const axios = require("axios").default;

const crearVenta = async (req, res = response) => {
  var objetoRespuesta = new Object({
    ok: true,
    msg: null,
    tipo_error: null,
  });

  var { comprador, productos, tipo_pago, nombreProducto, total } = req.body;
  if (!productos || !Array.isArray(productos) || productos.length == 0) {
    (objetoRespuesta.ok = false),
      (objetoRespuesta.msg = "Error en los datos recibidos.");
    objetoRespuesta.tipo_error =
      "Debes enviar un producto y debe ser un array.";

    return res.json(objetoRespuesta);
  }
  try {
    const token = req.header("x-access-token");

    if (!nombreProducto) {
      return res.json({
        ok: false,
        msg: "Debes enviar el nombre del producto.",
      });
    }
    if (!total) {
      return res.json({
        ok: false,
        msg: "Debes enviar el valor total del producto.",
      });
    }
    if (!token) {
      return res.json({
        ok: false,
        msg: "Debes estas logado.",
      });
    }

    var estado_venta = null;
    var obj = {};
    var tok = {};
    /////////// indicando tipo de pago ////////
    if (tipo_pago === 0) {
      req.body.estado_venta = 0;
    }


    /////////// indicando tipo de pago ////////
    if (tipo_pago === 1) {
      var idUsuario = retornarIdClienteConJWT(token);

      var totalConver = await consultarConvertirMonedaTiempoReal(total);
      total = totalConver.usd.toFixed(2);

      var cuentaBD = await CuentaPaypal.findOne({ usuario: idUsuario });

      tok = await crearPagoPaypal(cuentaBD.client, cuentaBD.secret, total);

     console.log("tok", tok);
     req.body.estado_venta = 0;
    /////Consultando datos de envio////

    
    //Asignando id datos de envío
    req.body.idProcesoPagoPaypal = tok.idVentaPaypal;

  

  
  
  }
    /// Consultando datos producto ///
    for (let index = 0; index < productos.length; index++) {
      const element = productos[index];

      var productoBD = await listarProductosPorIdProducto(element.producto);
      if (!productoBD.ok) {
        throw productoBD.msg;
      }
      var contadorTamanios = 0;

      productoBD.msg.tamanios.map((tamanios) => {
        if (tamanios._id == element.id_tamanio) {
          var contadorColor = 0;

          if (tamanios.precio_descuento) {
            req.body.productos[index].valor_producto_individual =
              tamanios.precio_descuento;
          } else {
            req.body.productos[index].valor_producto_individual =
              tamanios.precio;
          }
          req.body.productos[index].valor_total_productos =
            req.body.productos[index].valor_producto_individual *
            element.cantidad;
          req.body.productos[index].valor_total =
            req.body.productos[index].valor_total_productos +
            element.valor_envio;

          tamanios.colores.map((color) => {
            if (color.id == element.id_color) {
              if (element.cantidad > color.cantidad) {
                throw "La cantidad que deseas comprar excede el stock actual.";
              }
            } else {
              contadorColor = contadorColor + 1;
            }
          });

          if (contadorColor == tamanios.length) {
            throw "El Color enviado no existe en tamaño proporcionado, actualiza la página por favor.";
          }
        } else {
          contadorTamanios = contadorTamanios + 1;
        }
      });

      if (contadorTamanios == productoBD.msg.tamanios.length) {
        throw "No existe el tamaño que asignaste al producto.";
      }
    }

  if (!req.body.idProcesoPagoPaypal) {
    req.body.idProcesoPagoPaypal = "N/A"
  }
  var datosEnvioBD = await mostrarDatosEnvioIdUsuario(comprador);
  if (!datosEnvioBD.ok) return res.json(datosEnvioBD);
  req.body.datos_envio = datosEnvioBD.datos_envio._id;

  var nuevaVenta = await crearNuevaVenta(req.body);

    for (let index = 0; index < nuevaVenta.venta.productos.length; index++) {
      const element = nuevaVenta.venta.productos[index];

      var restar = await restarProductosVendidos(
        element.producto._id,
        element.id_tamanio,
        element.id_color,
        element.cantidad
      );
    }

if(tok.link){
  tok= tok.link
}else{
  tok = null
}

    return res.json({ restar, url_paypal: tok });


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

  const { usuario, telefono, direccion_completa, otras_indicaciones } =
    req.body;

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
    const { idUsuario } = req.params;

    var arrayIdsValidar = [];
    arrayIdsValidar.push(idUsuario);
    var validarIds = isValidObjectIdGeneral(1, arrayIdsValidar);
    if (!validarIds)
      return res.json({ ok: false, msg: "Debes enviar ids válidos." });

    ///Cuando todo sale ok/////
    var productosBD = await mostrarDatosEnvioIdUsuario(idUsuario);

    //productosBD.datos_envio.usuario =
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
