const fs = require("fs");
const Path = require("path");
const axios = require("axios");

const guardandoBanderas = async (uriBandertas) => {
  var contador = 0;
  for (let index = 0; index < uriBandertas.length; index++) {
    const nameMin = uriBandertas[index].abreviatura_dos.toLowerCase();
    const url = uriBandertas[index].uriBandertas.toLowerCase();

    const image_path = Path.resolve(
      __dirname,
      "../uploads/imagenes/banderas_paises",
      nameMin + ".svg"
    );

    axios({
      method: "get",
      url: url,
      responseType: "stream",
    }).then(function (response) {
      response.data.pipe(fs.createWriteStream(image_path));
      this.contador = this.contador + 1;
    });
  }
  var ret = new Object();
  ret.estado = 200;
  ret.banderas = uriBandertas.length;

  return ret;
};

const guardandoEnBdPaises = async () => {};

module.exports = {
  guardandoBanderas,
};
