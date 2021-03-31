const { response } = require('express');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario/usuario');

const validarExistenciaUsuario = async (req, res, next) => {

    const { email } = req.body;
    try {
        const existeusuario = await Usuario.findOne({ email });
        if (existeusuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe'
            });
        }
        else {
            next();
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        });
    }
}

const validarEmailDiferenteActualizar = async  (req, res, next) => {

    const {email} = req.body;
    if(email  ){
        return res.json({
            ok: false,
            msg: "No debes enviar email"
        });

    }else{
        next();
    }


}

const validarPermisos = async (req, res, next) => {
    

    
    const { roleuser } = req.body;
    console.log("user role: ", req.body);
    if (roleuser.toLowerCase() === 'admin' ) {
        next();
    }else{

        return res.status(400).json
        ({
            msg: "No tienes los permisos necesarios para ésta operación"
        });

    }


}
const validarDatosRecibidosUsuarios = async (req, res = response, next) => {
next()
}

module.exports = {
    validarExistenciaUsuario,
    validarPermisos,
    validarEmailDiferenteActualizar,
    validarDatosRecibidosUsuarios
}
