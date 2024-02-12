const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { conectarBaseDeDatos, conectar } = require("./conexion");
const { config } = require('dotenv');
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
conectarBaseDeDatos();

const cliente_id = "69558064090-4ot1f7uqnvidmgk61fu3fot6lajth5va.apps.googleusercontent.com";
const client_secret = "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";

async function obtenerUltimoRegistro() {
  const result = await conectar.query('SELECT * FROM refresh_tokens ORDER BY id DESC LIMIT 1');
  return result.rows[0];
}

function crearTransporte(ultimoRegistro) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "markoeldotado@gmail.com",
      clientId: cliente_id,
      clientSecret: client_secret,
      refreshToken: ultimoRegistro.refresh_token,
      accessToken: ultimoRegistro.access_token
    }
  });
}

function generarToken() {
  const payload = { contra: "markustlv" };
  return jwt.sign(payload, "marquinho1701", { expiresIn: "1d" });
}

// Ruta POST para enviar correo
app.post('/enviarmensaje', async (req, res) => {
  const correo = req.body.correo;
  try {
    const ultimoRegistro = await obtenerUltimoRegistro();
    const transporte = crearTransporte(ultimoRegistro);
    const resetLink = 'https://hotel-frontend-p2kt.onrender.com/restablecer';
    const token = generarToken();

    const contentHTML = `
      <h1>Recuperación de contraseña</h1>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}">${resetLink}</a>
      <br />
      <p>Guarda este Token para generar tu nueva contraseña:</p>
      <h2>${token}</h2>
      <h3>El token vence en un día, ten en cuenta eso. Si se vence, tendrás que generar otro restablecer.</h3>
    `;

    const enviodeDatosAlCorreo = {
      from: "markoeldotado@gmail.com",
      to: correo,
      subject: "Recuperación de contraseña",
      html: contentHTML
    };

    const respuesta = await transporte.sendMail(enviodeDatosAlCorreo);
    
    res.json(respuesta);
  } catch (error) {
    if (error.status === 400) {
      res.send("generar un nuevo token para la base de datos", correo);
    } else {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Error interno del servidor' });
    }
  }
});

const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
  console.log(`El servidor está corriendo en el puerto ${puerto}`);
});
