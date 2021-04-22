const { GoogleSpreadsheet  }  = require("google-spreadsheet")

const credenciales = require("./crendenciales.google.json");
const googleId = "1yIZIz9Ehy3VL2RxY4jCaCWBWst4pHp6XIdF2I8Ae_Rw";
const accederGoogleSheetHojaUno = async () => {
  const documento = new GoogleSpreadsheet(googleId);
  await documento.useServiceAccountAuth(credenciales);
  await documento.loadInfo();

  const hoja = documento.sheetsByIndex[0];
  const datos = await hoja.getRows();

  return datos;

}


module.exports = {
  accederGoogleSheetHojaUno,
}