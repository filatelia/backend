const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../../models/usuario/usuario');
const { generarJWT } = require('../../helpers/jwt');

const login = async( req, res = response ) => {

    const { email, password } = req.body;
    
    try {
        const usuarioDB = await Usuario.findOne({ email });
        
        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Email o contraseña invalidos.'
            });
        }

        const validPassword = bcrypt.compareSync( password, usuarioDB.password );
        if ( !validPassword ) {
            return res.status(400).json({
                ok: false,
                msg: 'Email o contraseña invalidos.'
            });
        }
        const token = await generarJWT( usuarioDB.roleuser, usuarioDB.name, usuarioDB.email, usuarioDB._id, usuarioDB.estado );

        var data={
            ok: true,
            token: token,
            uid:  usuarioDB._id,
            email:  usuarioDB.email,
            name: usuarioDB.name,
            role:  usuarioDB.roleuser,
        }
        res.json(data)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

};

const renewToken = async(req, res = response) => {

    const uid = req.uid;
    const token = await generarJWT( uid );
    res.json({
        ok: true,
        token
    });
}

module.exports = {
    login,
    renewToken
}
