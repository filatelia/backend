/*
    Ruta: /api/catalogo/manco_list/:idu
*/
const { Router } = require("express");
const router = Router();
const {
  paginacionMancolistas,
  eliminadoMuchasEstampillasMancolista,
  actualizarMancolist,
  listarTiposEspearadosEstampillas,
  validarMancolist,
  compartirManco_list,
  verMancolistCatId,
  agregarSerieMancolista,
  verMancolistPropia,
  catMancolist,
  getMancoListCat,
} = require("../../controllers/catalogo/manco_list.controlador");
const { validarJWT } = require("../../funciones/validar-jwt");

router.get("/listar/:id", compartirManco_list);
router.post("/", [validarJWT], actualizarMancolist);
router.post("/create-cat", [validarJWT], catMancolist);
router.put("/update-cat", [validarJWT], catMancolist);
router.get("/manco-list-cat", [validarJWT], getMancoListCat);
router.post("/validar/", [validarJWT], validarMancolist);
router.post("/agregar-serie/", [validarJWT], agregarSerieMancolista);
router.get(
  "/tipos-estado-estampilla/listar",
  [validarJWT],
  listarTiposEspearadosEstampillas
);

//Eliminando un array de estampilas de mancolista
router.post(
  "/eliminar-muchas/",
  [validarJWT],
  eliminadoMuchasEstampillasMancolista
);

router.post("/listar/", [validarJWT], verMancolistPropia);
router.get("/listar-id-cat", [], verMancolistCatId);

router.get("/paginacion", [validarJWT], paginacionMancolistas);

module.exports = router;
//Adasdasdasgit
