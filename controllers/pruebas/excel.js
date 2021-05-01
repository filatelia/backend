const Excel = require('exceljs');
const { response } = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { procesarExcelPruebas } = require('../../controllers/catalogo/catalogo.controlador')
const axios = require("axios");

const fs = require('fs');
var mongoose = require('mongoose');

const generarExcel = async (req, res=response) => {
  
  //Borrando archivo del  servidor
  fs.unlink(path.join(__dirname, "../../uploads/documentos/formato_filatelia.xlsx"), function (err) {
    if(err){
      console.log("No hay archivo para borrrar");

    }else{
      console.log("eliminado correctametne");

    }
    
  });

  const {id_catalogo} = req.params;

//se evalua que el id recibido sea valido
  if(!mongoose.isValidObjectId(id_catalogo)){
    return res.json({
      ok: false,
      msg: "El catalogo enviado no es válido"
    });

    
  } 


  const [, , filename] = process.argv;

  const wb = new Excel.Workbook();
  const ws = wb.addWorksheet('Formato catalogo');

  const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];


ws.columns = [
    { header: 'NUMERO', key: 'id', width: 10 },
    { header: 'CODIGO', key: 'id', width: 40 },
    { header: 'FOTO_ESTAMPILLAS', key: 'id', width: 20 },
    { header: 'DESCRIPCION_ESTAMPILLA', key: 'id', width: 30 },
    { header: 'NRO_ESTAMPILLAS', key: 'id', width: 20 },
    { header: 'CATEGORIA', key: 'id', width: 15 },
    { header: 'NUMERO_DE_CATALOGO', key: 'id', width: 25 },
    { header: 'TIPO', key: 'id', width: 15 },
    { header: 'ANIO', key: 'id', width: 10 },
    { header: 'GRUPO', key: 'id', width: 10 },
    { header: 'TITULO_DE_LA_SERIE', key: 'id', width: 40, },
    { header: 'VALOR_FACIAL', key: 'id', width: 15 },
    { header: 'TIPO_MONEDA_VALOR_FACIAL', key: 'id', width: 30 },
    { header: 'VALOR_CATALOGO_NUEVO', key: 'id', width: 26 },
    { header: 'VALOR_DEL_CATALOGO_USADO', key: 'id', width: 30 },
    { header: 'MONEDA_VALOR_CATALOGO_NUEVO_USADO', key: 'id', width: 43 },
    { header: 'VARIANTES_ERRORES', key: 'id', width: 40 },
    { header: 'FOTO_VARIANTES_ERRORES', key: 'id', width: 40 },

  ];
  var totalEstampillas = 43;

  //Centrando contenido de las columnas
  letrasColumnas.map((datos, i) => {
    ws.getCell(datos + '1'
    ).alignment = { vertical: 'center', horizontal: 'center' };

    });
    
    
  var contador = 0;
  for (let index = 2; index < totalEstampillas+ 2; index++) {
    contador = contador + 1;
    ws.getRow(index).values = [contador, uuidv4(),,,,,,,,,,,,,,,,uuidv4()];

  }


  for (let index = 1; index < totalEstampillas+2; index++) {
    
    letrasColumnas.map((datos, i)=>{
      ws.getCell(datos+index).border = {
        top: {style:'thin',  color: {argb:'ffd7d7d7'} },
        left: {style:'thin',  color: {argb:'ffd7d7d7'} },
        bottom: {style:'thin',  color: {argb:'ff696969'} },
        right: {style:'thin',  color: {argb:'ffd7d7d7'} }
      };


    });
    
  }


  

  const imageId1 = wb.addImage({
    filename: path.join(__dirname, '../../Captura.PNG'),
    extension: 'png'
  });
  
for (let index = 1; index < totalEstampillas+1; index++) {
  ws.addImage(imageId1,  {
    // tl: { col: 1, row: 1 },
    tl: 'B'+index,
    ext: {width: 140, height: 140},
  });
  ws.getRow(index+1).height = 105;
 
}
  
  wb.xlsx.writeFile(path.join(__dirname, "../../uploads/documentos/formato_filatelia.xlsx"))
    .then(() => {
      console.log('Done.');
      res.download(path.join(__dirname, "../../uploads/documentos/formato_filatelia.xlsx"));
     
    })
    .catch(error => {
      console.log(error.message);
    });
};

const guardarImagenDirectorioBase64 = async (req, res=response) =>{

  var { img64} = req.body;

  img64.map(data => 
    {
      fs.writeFile(path.join(__dirname, "../../uploads/imagenes/predeterminadas/prueba.png"), 
      data, 
      {encoding:'base64'},
      function (err) {
        if(err){
          console.log("error al guardar -> ", err);
        }
        else{
          console.log("Se ha guardado correctamente");
        }
      });
    });


}

module.exports = {
  generarExcel,
  guardarImagenDirectorioBase64
}