const nodemailer = require("nodemailer");
const { response } = require("express");
const path = require("path");
const { consultarUsuariosAdmin } = require("./usuario");
const Usuario = require("../models/usuario/usuario");

function transporter() {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "filatelia.backend@gmail.com", // generated ethereal user
      pass: "rotdxdgfnozhbhsq", // generated ethereal password
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  return transporter;
}
const enviarCorreos = async (
  emailAdmin,
  emailCliente,
  nombreUsuraio,
  mensajeEstadoSolicitud,
  res = response
) => {
  console.log("mensajeEstadoSolicitud", mensajeEstadoSolicitud);
  var email = "";
  var subjectEmail = "";
  var cuerpo = "";

  //Enviando mensajes a administradores

  //Enviando mensaje a administradores
  subjectEmail = "Nueva respuesta a solicitud 🔥";
  cuerpo =
    'Tenemos una nueva actualizacion en tu <a href="' +
    process.env.URLFRONT +
    'user/dashboard/catalogo">solicitud</a>.';
  await mensaje(
    emailCliente,
    subjectEmail,
    nombreUsuraio,
    cuerpo,
    mensajeEstadoSolicitud
  );

  //enviando mensaje a Cliente
  subjectEmail = "Nueva solicitud 🔥";
  cuerpo =
    'Necesitamos de tu ayuda, hay una <a href="' +
    process.env.URLFRONT +
    'admin/dashboard"> nueva solicitud</a> y necesitamos de tu revisión';

  var usuariosAdminBD = await Usuario.find({ roleuser: "admin" });

  for (let index = 0; index < usuariosAdminBD.length; index++) {
    const element = usuariosAdminBD[index];

    await mensaje(
      element.email,
      subjectEmail,
      element.name,
      cuerpo,
      mensajeEstadoSolicitud
    );
  }
};
const enviarCorreoAprobacion = async (solicitud, res = response) => {
  console.log("mensajeEstadoSolicitud", solicitud);
  var email = "";
  var subjectEmail = "";
  var cuerpo = "";
  var emailCliente = solicitud.usuario_id.email;
  var nombreUsuraio = solicitud.usuario_id.name;
  var mensajeEstadoSolicitud = solicitud.tipoEstadoSolicitud_id.descripcion;

  //Enviando mensajes a administradores

  //Enviando mensaje a administradores
  subjectEmail = "Nueva respuesta a solicitud 🔥";
  cuerpo =
    'Tenemos una nueva actualizacion en tu <a href="' +
    process.env.URLFRONT +
    'user/dashboard/catalogo">solicitud</a>.';
  await mensaje(
    emailCliente,
    subjectEmail,
    nombreUsuraio,
    cuerpo,
    mensajeEstadoSolicitud
  );

  //enviando mensaje a Cliente
  subjectEmail = "Nueva solicitud 🔥";
  cuerpo =
    'Necesitamos de tu ayuda, hay una <a href="' +
    process.env.URLFRONT +
    'admin/dashboard"> nueva solicitud</a> y necesitamos de tu revisión';
};
async function mensaje(
  email,
  subjectEmail,
  nombreUsuraio,
  cuerpo,
  mensajeEstadoSolicitud
) {
  // send mail with defined transport object
  let info = await transporter().sendMail({
    from: "Filatelia Peruana <filatelia.backend@gmail.com>", // sender address
    to: email, // list of receivers
    subject: subjectEmail, // Subject line
    html:
      "" + // html body
      "<p>¡Hola " +
      nombreUsuraio +
      "!</p>" +
      "<p>" +
      cuerpo +
      "</p>" +
      "<br><p>Estado Solicitud: " +
      mensajeEstadoSolicitud +
      " </p>" +
      "<br><p>Cordialmente,</p>" +
      "Equipo de solicutudes de Filatelia Peruana.<br><br>" +
      '<br><br><img width="100%" src="' +
      process.env.URLFRONT +
      'assets/img/logo.png">',
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = {
  enviarCorreos,
  enviarCorreoAprobacion,
};
