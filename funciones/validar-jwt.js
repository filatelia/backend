const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {

    // Leer el Token
    const token = req.header('x-access-token');

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const  { estado }  = jwt.verify( token, process.env.JWT_SECRET );
        
        if(estado == true){
            next();
        }else{
            return res.status(401).json({
                ok: false,
                msg: 'Token no válido'
            });
    
        }


    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
 
}
const retornarDatosJWT = (token) => {

    // Leer el Token
   const objetoUser = new Object();

 
    try {
        
        const  {email}   = jwt.verify( token, process.env.JWT_SECRET );
        

           return email;
        


    } catch (error) {
        return objetoUser = null;
    }
 
}
const retornarIdClienteConJWT = (token) => {

    // Leer el Token
   const objetoUser = new Object();

 
    try {
        
        const  {_id}   = jwt.verify( token, process.env.JWT_SECRET );
        

           return _id;
        


    } catch (error) {
        return objetoUser = null;
    }
 
}
const validarDeJWTRoleAdmin = (req, res, next) => {

    // Leer el Token
    const token = req.header('x-access-token');
    if(!token || token == null || token == ""){
        return res.json({
            ok:false,
            msg: "No hay token en la petición"
        })
    }

        const {roleuser} = jwt.verify( token, process.env.JWT_SECRET );
        console.log(roleuser);

     
        if (roleuser.toLowerCase() === 'admin' ) {
            next();
        }else{
    
            return res.status(400).json
            ({
                msg: "No tienes los permisos necesarios para ésta operación"
            });
    
        }

 
}
const validarDeJWTRoleCliente = (req, res, next) => {

    // Leer el Token
    const token = req.header('x-access-token');

        const {roleuser} = jwt.verify( token, process.env.JWT_SECRET );
        console.log("role user deszde validar admin: ", roleuser);

     
        if (roleuser.toLowerCase() === 'cliente' ) {
            next();
        }else{
    
            return res.status(400).json
            ({
                msg: "No tienes los permisos necesarios para ésta operación"
            });
    
        }

 
}

module.exports = {
    validarJWT,
    validarDeJWTRoleAdmin,
    retornarDatosJWT,
    validarDeJWTRoleCliente,
    retornarIdClienteConJWT
}