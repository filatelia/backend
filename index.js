require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fileUpload  = require('express-fileupload');
const { verificarBanderasPaises, verificarTipoSolicitudYCrearla }= require('./middlewares/setup');
const { dbConnection } = require('./database/config');
const path = require('path');
const { Promise } = require('mongoose');
const { promises } = require('dns');
// Crear el servidor de express
const app = express();


app.use(express.urlencoded( { extended:false } ));

app.use('/uploads',express.static(path.join(__dirname, 'uploads') ) );

app.use(express.static(path.join(__dirname, 'uploads') ) );

// Configurar CORS
app.use( cors() );

// Lectura y parseo del body
app.use( express.json() );

//carga de archivos con fileupload
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    createParentPath: true
}));


// Base de datos

    dbConnection();




//setup - verificando y creando archivos necesarios
 verificarBanderasPaises();
 verificarTipoSolicitudYCrearla();

// Rutas
app.use( '/api/catalogo/paises', require('./routes/catalogo/pais') );
app.use( '/api/catalogo/temas', require('./routes/catalogo/temas'));
app.use( '/api/usuarios', require('./routes/usuarios/users'));
app.use( '/api/catalogo/uploads/catalogo', require('./routes/catalogo/imagenes_cat'));
app.use( '/api/catalogo/uploads/excel', require('./routes/catalogo/catalogo'));
app.use( '/api/catalogo/', require('./routes/catalogo/mostrarImgs'));
app.use( '/api/catalogo/manco_list/', require('./routes/catalogo/manco_list'));
app.use( '/api/solicitudes/', require('./routes/solicitudes/solicitudes.route'));


app.use( '/api/pruebas', require('./routes/pruebas/excel'));

//app.use( '/api/catalogo/temas', require('./routes/catalogo/temas') );
app.use( '/api/login', require('./routes/auth/auth') );

app.listen(  process.env.PORT, () => {
    console.log('Servidor corriendo en puerto ' + process.env.PORT );
});

