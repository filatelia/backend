const { response } = require("express");
const { isValidObjectId } = require("mongoose");
const CuentasBancarias = require("../../models/pagos/cuentasBancarias");

const crearCuentaBancaria = async (req, res = response) => {
  try {
    console.log("");
    console.log("Creando cuenta bancaria");

    var objCuentaBancaria = new CuentasBancarias(req.body);

    var nuevaCuenta = await objCuentaBancaria.save();

    nuevaCuenta.usuario = nuevaCuenta.usuario._id;

    return res.json({
      ok: true,
      msg: "Cuenta creada correctamente",
      nuevaCuenta: nuevaCuenta,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error al crear la cuenta, ver error ->",
      error: "" + error,
    });
  }
};

const ConsultarCuentaBancaria = async (req, res = response) => {
  try {
    console.log("");
    console.log("Consultando cuenta bancaria");

    var { usuario } = req.params;

    if (!isValidObjectId(usuario)) {
      return res.json({
        ok: false,
        msg: "No has enviado un id válido.",
        cuenta: cuenta,
      });
    }
    var cuenta = await CuentasBancarias.findOne({ usuario });

    cuenta.usuario = cuenta.usuario._id;

    return res.json({
      ok: true,
      msg: "Cuenta consultada correctamente",
      cuenta: cuenta,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error al consultar la cuenta, ver error ->",
      error: "" + error,
    });
  }
};

const editarCuentaBancaria = async (req, res = response) => {
  try {
    console.log("");
    console.log("Modificando cuenta bancaria");

    var {usuario} = req.body;
    

    var nuevaCuenta = await CuentasBancarias.findOneAndUpdate(usuario, req.body,{new:1});

    nuevaCuenta.usuario = nuevaCuenta.usuario._id;

    return res.json({
      ok: true,
      msg: "Cuenta actualizada correctamente",
      nuevaCuenta: nuevaCuenta,
    });
  } catch (error) {
    return res.json({
      ok: false,
      msg: "Error al actualizar la cuenta, ver error ->",
      error: "" + error,
    });
  }
};

const eliminarCuentaBancaria = async (req, res = response) => {
    try {
      console.log("");
      console.log("Modificando cuenta bancaria");
  
      var {usuario} = req.params;
      if (!isValidObjectId(usuario)) {
        return res.json({
          ok: false,
          msg: "No has enviado un id válido.",
          cuenta: cuenta,
        });
      }
    await CuentasBancarias.findOneAndDelete(usuario);
  
     
  
      return res.json({
        ok: true,
        msg: "Cuenta eliminada correctamente",

      });
    } catch (error) {
      return res.json({
        ok: false,
        msg: "Error al eliminar la cuenta, ver error ->",
        error: "" + error,
      });
    }
  };



module.exports = {
  crearCuentaBancaria,
  ConsultarCuentaBancaria,
  editarCuentaBancaria,
  eliminarCuentaBancaria
};
