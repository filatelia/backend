const { response } = require("express");
const Pais = require("../../models/catalogo/paises");
const fs = require("fs");
const Path = require("path");
const Estampillas = require("../../models/catalogo/estampillas.modelo");
const Catalogo = require("../../models/catalogo/catalogo");

const getPaisById = async (req, res = response) => {
  const _id = req.params.pid;

  const paisEncontrado = await Pais.findOne({ _id });
  console.log("pais encontrado", paisEncontrado);
  if (!paisEncontrado) {
    return res.json("No se ha encontrado el pais con el id proporcionado");
  }

  const pahtImagen = Path.join(__dirname, "../.." + paisEncontrado.img);
  paisEncontrado.img = pahtImagen;

  return res.json(paisEncontrado);
};

const getPaisByName = async (req, res = response) => {
  const names = req.params.name;

  if (names != "all") {
    try {
      const para_buscar = names.toLowerCase().replace(/\s+/g, "");
      console.log("para buscar:", para_buscar);
      const paisEncontrado = await Pais.findOne({ para_buscar });
      console.log("pais encontrado", paisEncontrado);
      if (!paisEncontrado) {
        return res.json(
          "No se ha encontrado el pais, recuerde no usar caracteres especiales"
        );
      }

    
      return res.json(paisEncontrado);
    } catch (e) {
      res.json({msg: e});
    }
  } else {
    console.log("all, buscando");
    const ret = await getTodosPaises();
    return res.json({ ok: true, msg: ret });
  }
};

const getTodosPaises = async (req, res = response) => {
  const paisEncontrado = await Pais.find();
 

  return paisEncontrado;
};
const getPaisCatalogo = async (req, res = response) => {
 /**
  const paisBD = await Catalogo.aggregate([
    {
      $match:{}
    },
    {
      $group:{
        _id:"$pais",
      }
    },
    {
      $project:{
        _id:1,
      }
    },
    {
      $lookup: {
          from: "bdfc_pais",
          localField: "_id",
          foreignField: "_id",
          as: "pais",
      },
    },
    {
      $project:{
        _id:1,
        pais:{$arrayElemAt: ["$pais", 0]},
      }
    },
    
  ]);

 */

var respuesta = await Catalogo.find({},{solicitudes:1});
var pais = [];
var objPais = new Object();
 
respuesta.map((data) => {
    if (data.pais && data.solicitud.tipoEstadoSolicitud_id.abreviacion === "ACE2") {
      console.log("entramos", data.solicitud.tipoEstadoSolicitud_id.abreviacion);
      objPais._id = data.pais._id; 
      objPais.pais = data.pais; 
      pais.push(objPais);
    }
  });

  
 console.log("pais ->", pais);


 res.status(200).send({
    data:pais,
    ok:true
  })
};
module.exports = {
  getPaisByName,
  getPaisById,
  getTodosPaises,
  getPaisCatalogo,
};
