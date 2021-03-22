const { response } = require("express");
const Usuario = require('../models/usuario/usuario');

const consultarUsuariosAdmin = async (res = response) => {
console.log("Entramos a consuiltar");
    try {
        const usuariosAdmin = await Usuario.find( { roleuser: 'admin' } );

        return usuariosAdmin;
    } catch (e) {
    return res.json({
        ok: false,
        msg: "Localizacion del error | middlewears > usuarios",
        e: e
    });
    }
}

module.exports = {
    consultarUsuariosAdmin
}
