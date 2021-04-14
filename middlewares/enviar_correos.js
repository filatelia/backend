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
  emailCliente,
  nombreUsuraio,
  mensajeEstadoSolicitud
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
const enviarCorreosReporte = async (
  reporte
) => {
  var emailReportado =  reporte.usuario_reportado.email;
  var emailReportante = reporte.usuario_reportante.email;
  var nombreUsuario = "";
  var subjectEmail = "";
  var cuerpo = "";

  //Enviando mensaje a usuario reportado

  nombreUsuario = reporte.usuario_reportado.name;
  if(reporte.usuario_reportado.apellidos){
    nombreUsuario = reporte.usuario_reportado.name+" "+ reporte.usuario_reportado.apellidos;
  }

  subjectEmail = "Te han reportado 😞";
  cuerpo ='<p>Lamentamos informarte que uno de nuestros Usuarios te ha reportado.</p>'+
   '<p>El reporte se ha creado y será analizado por uno de nuestros administradores, para validar'+
   ' si el reporte es un error, de lo contrario, se tomarán las medidas pertinentes.</p>';
  await mensajeReporte(
    reporte,
    cuerpo,
    subjectEmail,
    emailReportado,
    nombreUsuario
    
  );

  nombreUsuario= "";
  //enviando mensaje a Cliente Reportante
  nombreUsuario = reporte.usuario_reportante.name;
  if(reporte.usuario_reportante.apellidos){
    nombreUsuario = reporte.usuario_reportante.name+" "+ reporte.usuario_reportante.apellidos;
  }
  subjectEmail = "Reporte Creado | Gracias por contribuir 😇";
  cuerpo ='<p>Agradecemos tu voluntad para un mejor ambiente en nuestros chats, esperamos que sigas contribuyendo a nuestra comunidad de Filatelia.</p>'+
  '<p>El reporte se ha creado y será analizado por uno de nuestros administradores.<p>';
  await mensajeReporte(
    reporte,
    cuerpo,
    subjectEmail,
    emailReportante,
    nombreUsuario
  );

  //enviando mensaje a Administradores
  subjectEmail = "Moderación | Reporte Nuevo 😎";
  cuerpo ='<p>Tenemos un nuevo reporte para que revises.</p>';


  var usuariosAdminBD = await Usuario.find({ roleuser: "admin" });

  for (let index = 0; index < usuariosAdminBD.length; index++) {
    const element = usuariosAdminBD[index];

    await mensajeReporteAdmin(
      reporte,
    cuerpo,
    subjectEmail,
    element.email,
    element.name,
    element.apellidos
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
      "Equipo de solicitudes de Filatelia Peruana.<br><br>" +
      '<br><br><img width="100%" src="' +
      process.env.URLFRONT +
      'assets/img/logo.png">',
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
async function mensajeReporte(
  reporte,
  cuerpo,
  subjectEmail,
  email,
  nombreUsuario
 
) {
 
  // send mail with defined transport object
  let info = await transporter().sendMail({
    from: "Filatelia Peruana <filatelia.backend@gmail.com>", // sender address
    to: email, // list of receivers
    subject: subjectEmail, // Subject line
    html:
      "" + // html body
      "<p>¡Hola " +
      nombreUsuario +
      "!</p>" +
      "<p>" +
      cuerpo +
      "</p>" +
      "<br><p>Estado Reporte: " +
      reporte.tipo_estado_reporte.nombre +
      " </p>" +
      "<br><p>Descripción Estado Reporte: " +
      reporte.tipo_estado_reporte.descripcion+
      " </p>" +
      "<br><p>Cordialmente,</p>" +
      "Equipo de Moderación de Filatelia Peruana.<br><br>" +
      '<br><br><img width="100%" src="' +
      process.env.URLFRONT +
      'assets/img/logo.png">',
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


async function mensajeReporteAdmin(
  reporte,
  cuerpo,
  subjectEmail,
  email,
  nombre,
  apellidos
 
) {
  var nombreUsuario = nombre;
  if (apellidos) {
    nombreUsuario = nombre +" "+apellidos; 
    
  }
  // send mail with defined transport object
  let info = await transporter().sendMail({
    from: "Filatelia Peruana <filatelia.backend@gmail.com>", // sender address
    to: email, // list of receivers
    subject: subjectEmail, // Subject line
    html:
      "" + // html body
      "<p>¡Hola " +
      nombreUsuario +
      "!</p>" +
      "<p>" +
      cuerpo +
      "</p>" +
      "<br><p>Estado Reporte: " +
      reporte.tipo_estado_reporte.nombre +
      " </p>" +
      "<br><p>Descripción Estado Reporte: " +
      reporte.tipo_estado_reporte.descripcion+
      " </p>" +
      "<br><p>Cordialmente,</p>" +
      "Equipo de Moderación de Filatelia Peruana.<br><br>" +
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
  enviarCorreosReporte
};
