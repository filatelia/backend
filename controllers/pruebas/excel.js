const { response } = require('express');
var excel = require('xlsx');
const nodemailer = require("nodemailer");


const deExcelAJson = async() => {

    // Generate test SMTP service account from ethereal.email
 // Only needed if you don't have a real mail account for testing
 let testAccount = await nodemailer.createTestAccount();

 // create reusable transporter object using the default SMTP transport
 let transporter  = await nodemailer.createTransport({
   host: "smtp.gmail.com",
   port: 465,
   secure: true, // true for 465, false for other ports
   auth: {
     user: 'filatelia.backend@gmail.com', // generated ethereal user
     pass: 'rotdxdgfnozhbhsq', // generated ethereal password
   },
   tls: {
       // do not fail on invalid certs
       rejectUnauthorized: false
     }
 });

 // send mail with defined transport object
 let info = await transporter.sendMail({
   from: 'Filatelia Peruana <filatelia.backend@gmail.com>', // sender address
   to: "alexis11dimen@gmail.com", // list of receivers
   subject: "Nueva solicitud 🔥", // Subject line
   text: "Hello world?", // plain text body
   html: ''+ // html body
   '<p>¡Hola Administrador!</p>' +
   '<p>Necesitamos de tu ayuda, hay una <a href="http://nuevo.filateliaperuana.com/admin/dashboard"> nueva solicitud</a> y necesitamos de tu revisión</p>'+
   '<br><p>Cordialmente,</p>'+
   'Equipo de solicutudes de Filatelia Peruana.<br><br>'+
   '<br><br><img width="100%" src="http://nuevo.filateliaperuana.com/assets/img/logo.png">'
 });

 console.log("Message sent: %s", info.messageId);
 // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

 // Preview only available when sending through an Ethereal account
 console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

} 

const paraAdmin = async() => {

     // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter  = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'filatelia.backend@gmail.com', // generated ethereal user
      pass: 'rotdxdgfnozhbhsq', // generated ethereal password
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'Filatelia Peruana <filatelia.backend@gmail.com>', // sender address
    to: "alexis11dimen@gmail.com", // list of receivers
    subject: "Nueva solicitud 🔥", // Subject line
    text: "Hello world?", // plain text body
    html: ''+ // html body
    '<p>¡Hola Administrador!</p>' +
    '<p>Necesitamos de tu ayuda, hay una <a href="http://nuevo.filateliaperuana.com/admin/dashboard"> nueva solicitud</a> y necesitamos de tu revisión</p>'+
    '<br><p>Cordialmente,</p>'+
    'Equipo de solicutudes de Filatelia Peruana.<br><br>'+
    '<br><br><img width="100%" src="http://nuevo.filateliaperuana.com/assets/img/logo.png">'
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

} 
 
const paraCliente = async() => {

    // Generate test SMTP service account from ethereal.email
 // Only needed if you don't have a real mail account for testing
 let testAccount = await nodemailer.createTestAccount();

 // create reusable transporter object using the default SMTP transport
 let transporter  = await nodemailer.createTransport({
   host: "smtp.gmail.com",
   port: 465,
   secure: true, // true for 465, false for other ports
   auth: {
     user: 'filatelia.backend@gmail.com', // generated ethereal user
     pass: 'rotdxdgfnozhbhsq', // generated ethereal password
   },
   tls: {
       // do not fail on invalid certs
       rejectUnauthorized: false
     }
 });

 // send mail with defined transport object
 let info = await transporter.sendMail({
   from: 'Filatelia Peruana <filatelia.backend@gmail.com>', // sender address
   to: "alexis11dimen@gmail.com", // list of receivers
   subject: "Nueva solicitud 🔥", // Subject line
   text: "Hello world?", // plain text body
   html: ''+ // html body
   '<p>¡Hola Administrador!</p>' +
   '<p>Necesitamos de tu ayuda, hay una <a href="http://nuevo.filateliaperuana.com/admin/dashboard"> nueva solicitud</a> y necesitamos de tu revisión</p>'+
   '<br><p>Cordialmente,</p>'+
   'Equipo de solicutudes de Filatelia Peruana.<br><br>'+
   '<br><br><img width="100%" src="http://nuevo.filateliaperuana.com/assets/img/logo.png">'
 });

 console.log("Message sent: %s", info.messageId);
 // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

 // Preview only available when sending through an Ethereal account
 console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

} 

module.exports = {
deExcelAJson
}