const jwt = require("jsonwebtoken");

const generarJWT = (roleuser, name, email, _id, estado) => {
  return new Promise((resolve, reject) => {
    console.log("token");

    const payload = {
      roleuser,
      name,
      email,
      _id,
      estado,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el Token");
        } else {
          resolve(token);
        }
      }
    );
  });
};
const generarJWTMes = (roleuser, name, email, _id, estado) => {
  return new Promise((resolve, reject) => {
    console.log("token");

    const payload = {
      roleuser,
      name,
      email,
      _id,
      estado,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "720h",
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el Token");
        } else {
          resolve(token);
        }
      }
    );
  });
};
module.exports = {
  generarJWT,
  generarJWTMes
};
