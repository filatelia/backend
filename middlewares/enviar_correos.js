const nodemailer = require("nodemailer");
const { response } = require("express");
const path = require("path");
const { consultarUsuariosAdmin } = require("./usuario");

const enviarCorreos = async (res = response) => {
  try {
    console.log("entramos a correo");

    //Consultar usuarios administrador
    const administradores = await consultarUsuariosAdmin();

    const transporter = nodemailer.createTransport({
      host: "mail.filateliaperuana.com",
      port: 25,
      secure: true,
      auth: {
        user: process.env.USEMAIL,
        pass: process.env.PSEMAIL,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    for (let index = 0; index < administradores.length; index++) {
      const element = administradores[index];
      await transporter.sendMail({
        from: "'Filatelia Peruana 🔔' <solicitudes@filateliaperuana.com>",
        to: "" + element.email,
        subject: "Tienes una nueva solicitud.",
        html:
          "<h1>Hola " +
          element.name +
          "</h1>" +
          "<p>Uno de nuestros usuarios ha solicitado una nueva aprobación.</p>" +
          "<p>Necesitamos de tu apoyo en ésta nueva solicitud.</p>" +
          "<p>¡Muchas gracias!</p><br><br>" +
          "<p>Cordialmente,</p>" +
          "<p>Equipo de validación de solicitudes.</p>" +
          "<hr>" +
          "<a href='https://www.filateliaperuana.com/'>Filatelia Peruana.</a>",
      });

      console.log("Correo enviado a: ", element.email.replace(/\s+/g, ""));

    
    }
  } catch (e) {
    return res.json({
      ok: false,
      msg: "Error al enciar correo",
      localización: "middlewears -> enviar_coreo.js",
      error: e,
    });
  }
};

module.exports = {
  enviarCorreos,
};
