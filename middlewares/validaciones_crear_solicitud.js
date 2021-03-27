const { buscarPaisPorNombre } = require("./paises");
const Solicitud = require("../models/solicitudes/solicitudes.model");
const { isValidObjectId } = require("mongoose");
const Tipo_Catalgo = require("../models/catalogo/tipo_catalogo");
const Temas = require("../models/catalogo/temas");
const Pais = require("../models/catalogo/paises");
const { buscarTema, crearNuevoTema } = require("./temas");

const validarNuevaSolicitud = async (req, res, next) => {
  try {
    //Obteniendo valores del body
    const {
      nombre_catalogo_solicitud,
      tipo_catalogo_solicitud,
      pais_catalogo_solicitud,
      tema_catalogo_solicitud,
      id_solicitud,
    } = req.body;

    //Verificando si existe id solicitud, si existe sería una solicitud de tipo 2
    if (id_solicitud && id_solicitud != null) {
      if (isValidObjectId(id_solicitud)) {
        const solicitudRecibidaBD = await Solicitud.findOne({
          _id: id_solicitud,
        });

        if (solicitudRecibidaBD == null) {
          return res.json({
            ok: false,
            msg: "La solicitud que estas enviando no existe",
          });
        } else {
          console.log("Next");
          next();
        }
      } else {
        return res.json({
          ok: false,
          msg: "No has enviado una solicitud válida",
        });
      }
    } else {
      //Validando que los campos existan y no sean nulos
      if (
        !nombre_catalogo_solicitud ||
        !tipo_catalogo_solicitud ||
        nombre_catalogo_solicitud == null ||
        tipo_catalogo_solicitud == null
      ) {
        return res.json({
          ok: false,
          msg: "Debes enviar los datos obligatorios",
          nombre_catalogo_recibido: nombre_catalogo_solicitud,
          tipo_catalogo_recibido: tipo_catalogo_solicitud,
        });
      }

      //Se verifica que sea un id tipo catalogo válido
      if (isValidObjectId(tipo_catalogo_solicitud)) {
        //Buscando el id en la base datos
        const tipoCatalogoBD = await Tipo_Catalgo.findById(
          tipo_catalogo_solicitud
        );

        //Verificando si existe ese id tipo de catalogo
        if (tipoCatalogoBD != null) {
          //Se valida si se escoge temático debe enviar nombre del tema y ese no existe se crea
          if (tipoCatalogoBD.name == "Temático") {
            console.log("Tipo catalogo seleccionado Temático");
            if (!tema_catalogo_solicitud || tema_catalogo_solicitud == null) {
              return res.json({
                ok: false,
                msg:
                  "Seleccionaste un tipo de catalogo Temático, pero no enviaste el nombre del tema",
              });
            } else {
              //Se debe validar si el tema enviado, ya existe en la base de datos, sino se crea.
              var temasBD = await buscarTema(tema_catalogo_solicitud);
              if (temasBD == null) {
                console.log("Tema no encontrado en BD");
                console.log("Creando tema...");
                var nuevoTema = await crearNuevoTema(tema_catalogo_solicitud);

                if (nuevoTema == null || !nuevoTema) {
                  return res.json({
                    ok: false,
                    msg: "Problemas al crear el nuevo tema",
                  });
                }
              } else {
                console.log("Tema encontrado en BD");
              }
            }
          }

          // Se valida que si se escoge tipo de catalogo país, se envié el pais
          if (tipoCatalogoBD.name == "País") {
            //Se valida que se envié el pais
            if (!pais_catalogo_solicitud || pais_catalogo_solicitud == null) {
              return res.json({
                ok: false,
                msg:
                  "Seleccionaste tipo de catalogo País, debes enviar un país",
              });
            }

            //Buscando pais en BD
            var paisBD = await buscarPaisPorNombre(pais_catalogo_solicitud);
            if (paisBD == null) {
              return res.json({
                ok: false,
                msg: "El país enviado no existe en la base de datos.",
              });
            }
          }
        } else {
          return res.json({
            ok: false,
            msg: "El tipo catalogo enviado no existe",
          });
        }
      } else {
        return res.json({
          ok: false,
          msg: "No has enviado un tipo de catálogo válido",
        });
      }

      console.log("Validando datos recibidos....");
      console.log("Validaciones Crear Solicitud... OK");
      next();
    }
  } catch (e) {
    return res.json({
      ok: false,
      msg:
        "Error no validado, captado desde catch validaciones crear solicitud",
      error: e,
    });
  }
};

module.exports = {
  validarNuevaSolicitud,
};
