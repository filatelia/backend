/*
    Path: '/api/login'
*/
const { Router } = require("express");
const { login, generarTMes } = require("../../controllers/auth/login");
const { check } = require("express-validator");
const { validarCampos } = require("../../funciones/validar-campos");
const { validarJWT } = require("../../funciones/validar-jwt");

const router = Router();

router.post(
  "/",
  [
    check("email", "El email es obligatorio").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  login
);

router.get("/token-mes", [validarJWT], generarTMes);

/*
router.get( '/renew',
    validarJWT,
    renewToken
)
*/
module.exports = router;
