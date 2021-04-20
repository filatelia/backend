const Estampillas = require("../models/catalogo/estampillas.modelo");

const eliminarEstampillasConIdCatalogo = async (id_catalogo) => {
  var eliminandoEstampillas = await Estampillas.deleteMany({
    Catalogo: id_catalogo,
  });
  return eliminandoEstampillas;
};

module.exports = {
  eliminarEstampillasConIdCatalogo,
};
