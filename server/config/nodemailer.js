// // config/transporter.js
// import dotenv from "dotenv";
// dotenv.config();

// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

// export default transporter;


import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

console.log("=== TRANSPORTER CONFIG ===");

console.log({
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
});

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log("TRANSPORTER VERIFY ERROR:");
    console.log(error);
  } else {
    console.log("SMTP SERVER READY");
  }
});

export default transporter;