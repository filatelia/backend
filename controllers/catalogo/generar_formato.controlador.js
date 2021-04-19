const Excel = require("exceljs");
const { response } = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
var mongoose = require("mongoose");
var { ObjectId } = require("mongoose").Types;
const ImagenesEstampillas = require("../../models/catalogo/uploads");
const Estampillas = require("../../models/catalogo/estampillas.modelo");


const generarExcel = async (req, res = response) => {

  const { id_catalogo } = req.params;

  //se evalua que el id recibido sea valido
  if (!mongoose.isValidObjectId(id_catalogo)) {
    return res.json({
      ok: false,
      msg: "El catalogo enviado no es válido",
    });
  }


  var arrCodigosImagenesNoAsociadas = [];
  var arrImagenesNoAsociadas = [];
  //Buscar imagenes de estampillas del catálogo
  const imagenesEstampillasBD = await ImagenesEstampillas.aggregate(
    [

      { 
        $lookup: {
          from: "bdfc_estampillas",
          localField: "codigo_estampilla",
          foreignField:"CODIGO",
          as: "arrEstampilla"
        }
      },
     {
       $project: {
        catalogo:1,
         estampillaAsociada: { $arrayElemAt: ["$arrEstampilla", 0] },
         codigo_estampilla:1,
         imagen_url:1
       }
     },
     {
       $match: {
        catalogo: ObjectId(id_catalogo)
       }
     },
     

    ]
    );

    imagenesEstampillasBD.map((data) => {
      if (!data.estampillaAsociada){
        
        
        arrCodigosImagenesNoAsociadas.push(data.codigo_estampilla);
        arrImagenesNoAsociadas.push(data);
      }
    });
    console.log("imagenesEstampillasBD -> ",imagenesEstampillasBD.length);
    console.log("imagenesNoAsociadas -> ", arrCodigosImagenesNoAsociadas);


  const [, , filename] = process.argv;

  const wb = new Excel.Workbook();
  const ws = wb.addWorksheet("Formato catalogo");

  const letrasColumnas = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
  ];

  //agregando titulos de las columnas
  ws.columns = [
    { header: "NUMERO", key: "id", width: 10 },
    { header: "CODIGO", key: "id", width: 40 },
    { header: "FOTO_ESTAMPILLAS", key: "id", width: 20 },
    { header: "DESCRIPCION_ESTAMPILLA", key: "id", width: 30 },
    { header: "NRO_ESTAMPILLAS", key: "id", width: 20 },
    { header: "CATEGORIA", key: "id", width: 15 },
    { header: "NUMERO_DE_CATALOGO", key: "id", width: 25 },
    { header: "TIPO", key: "id", width: 15 },
    { header: "ANIO", key: "id", width: 10 },
    { header: "GRUPO", key: "id", width: 10 },
    { header: "TITULO_DE_LA_SERIE", key: "id", width: 40 },
    { header: "VALOR_FACIAL", key: "id", width: 15 },
    { header: "TIPO_MONEDA_VALOR_FACIAL", key: "id", width: 30 },
    { header: "VALOR_CATALOGO_NUEVO", key: "id", width: 26 },
    { header: "VALOR_DEL_CATALOGO_USADO", key: "id", width: 30 },
    { header: "MONEDA_VALOR_CATALOGO_NUEVO_USADO", key: "id", width: 43 },
    { header: "VARIANTES_ERRORES", key: "id", width: 40 },
    { header: "FOTO_VARIANTES_ERRORES", key: "id", width: 40 },
  ];

  //Asignando total de imagenes a mostrar
  var totalEstampillas = arrCodigosImagenesNoAsociadas.length;

  //Centrando contenido de las columnas
  letrasColumnas.map((datos, i) => {
    ws.getCell(datos + "1").alignment = {
      vertical: "center",
      horizontal: "center",
    };
  });

  //agregando ids al excel
  var contador = 0;
  for (let index = 2; index < totalEstampillas + 2; index++) {
    contador = contador + 1;
    ws.getRow(index).values = [
      contador,
      arrCodigosImagenesNoAsociadas[index - 2].codigo_estampilla,

    ];
  }

  for (let index = 1; index < totalEstampillas + 2; index++) {
    letrasColumnas.map((datos, i) => {
      ws.getCell(datos + index).border = {
        top: { style: "thin", color: { argb: "ffd7d7d7" } },
        left: { style: "thin", color: { argb: "ffd7d7d7" } },
        bottom: { style: "thin", color: { argb: "ff696969" } },
        right: { style: "thin", color: { argb: "ffd7d7d7" } },
      };
    });
  }

  for (let index = 1; index < totalEstampillas + 1; index++) {
    ws.addImage(
      wb.addImage({
        filename: path.join(
          __dirname,
          "../../uploads/" + arrImagenesNoAsociadas[index - 1].imagen_url
        ),
        extension: "png",
      }),

      {
        // tl: { col: 1, row: 1 },
        tl: "B" + index,
        ext: { width: 140, height: 140 },
      }
    );
    ws.getRow(index + 1).height = 105;
  }

  var nombreDocumento = uuidv4();
  wb.xlsx
    .writeFile(
      path.join(__dirname, "../../uploads/documentos/"+nombreDocumento+".xlsx")
    )
    .then(() => {
      console.log("Done.");
    var descargar =  res.download(
        path.join(__dirname, "../../uploads/documentos/"+nombreDocumento+".xlsx")

      );
      fs.unlink(
        path.join(__dirname, "../../uploads/documentos/"+nombreDocumento+".xlsx"),
        function (err) {
          if (err) {
            console.log("No hay archivo para borrrar");
          } else {
            console.log("eliminado correctametne");
          }
        }

      );

      console.log("Descarga", descargar);
    })
    .catch((error) => {
      console.log(error.message);
    });





};

module.exports = {
  generarExcel,
};
