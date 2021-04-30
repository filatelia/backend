const { GoogleSpreadsheet  }  = require("google-spreadsheet")

const credenciales = require("./crendenciales.google.json");
const googleIdFotoEstampillas = "1yIZIz9Ehy3VL2RxY4jCaCWBWst4pHp6XIdF2I8Ae_Rw";
const accederGoogleSheetHojaFotoEstampillas = async () => {
  const documento = new GoogleSpreadsheet(googleIdFotoEstampillas);
  await documento.useServiceAccountAuth(credenciales);
  await documento.loadInfo();

  const hoja = documento.sheetsByIndex[0];
  const datos = await hoja.getRows();

  return datos;

}

const googleIdVariantesErrorestampillas = "1tmmJWSWuYMshDMqbKSRaH10n2R8BH8gXjKM7rGPxlXQ";

const accederGoogleSheetHojaVariantes = async () => {
  const documento = new GoogleSpreadsheet(googleIdVariantesErrorestampillas);
  await documento.useServiceAccountAuth(credenciales);
  await documento.loadInfo();

  const hoja = documento.sheetsByIndex[0];
  const datos = await hoja.getRows();

  return datos;

}


module.exports = {
  accederGoogleSheetHojaFotoEstampillas,
  accederGoogleSheetHojaVariantes
}