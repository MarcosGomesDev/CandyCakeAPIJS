require('dotenv').config()

const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.PASS
            }
        });

        await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email enviado com sucesso");
    } catch (error) {
        console.log(error, "email não enviado");
    }
};

module.exports = sendEmail;