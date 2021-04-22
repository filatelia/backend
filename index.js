require("dotenv").config();
const Color = require('colors');

const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const {
  verificarBanderasPaises,
  verificarTipoSolicitudYCrearla,
  initial_setup,
} = require("./middlewares/setup");
const { dbConnection } = require("./database/config");
const path = require("path");
const { Promise } = require("mongoose");
const { promises } = require("dns");
// Crear el servidor de express
const app = express();

app.use(express.urlencoded({ extended: false }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "uploads")));

// Configurar CORS
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

//carga de archivos con fileupload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

// Base de datos y configuracion inicial

dbConnection()
  .then((res) => {
    //setup - verificando y creando archivos necesarios
    initial_setup().then((res) => {
      console.log(Color.blue("¡Setup ejecutado correctamente!"));
    });
  })
  .catch((error) => {
    console.log("Error al conectarse a la base de datos", error);
    return;
  });

// Rutas
app.use("/api/catalogo/paises", require("./routes/catalogo/pais"));
app.use("/api/catalogo/temas", require("./routes/catalogo/temas"));
app.use("/api/usuarios", require("./routes/usuarios/users"));
app.use(
  "/api/catalogo/uploads/catalogo",
  require("./routes/catalogo/imagenes_cat")
);
app.use("/api/catalogo/uploads/excel", require("./routes/catalogo/catalogo"));
app.use("/api/catalogo/", require("./routes/catalogo/mostrarImgs"));
app.use("/api/catalogo/manco_list/", require("./routes/catalogo/manco_list"));
app.use("/api/catalogo/tipo-catalogo", require("./routes/catalogo/tipo_catalogo"));
app.use("/api/solicitudes/", require("./routes/solicitudes/solicitudes.route"));
app.use("/api/estampillas/", require("./routes/catalogo/estampillas.ruta"));
app.use("/api/variantes-errores/", require("./routes/catalogo/variantes_errrores.ruta"));
app.use("/api/reportes/", require("./routes/reportes/formato-excel.ruta"));

app.use("/api/pruebas/", require("./routes/pruebas/excel"));
app.use("/api/moderacion/", require("./routes/moderacion/moderacion.ruta"));

//app.use( '/api/catalogo/temas', require('./routes/catalogo/temas') );
app.use("/api/login", require("./routes/auth/auth"));

app.listen(process.env.PORT, () => {
  console.log("Servidor corriendo en puerto " + process.env.PORT);
});


