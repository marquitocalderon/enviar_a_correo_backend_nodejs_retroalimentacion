const { config } = require('dotenv');

// const { Client } = require('pg');


// // Configuración de la conexión a PostgreSQL
// const conectar = new Client({
//   user: 'marco',
//   host: 'dpg-clqa0kggqk6s738qtk4g-a',
//   database: 'backendnube',
//   password: '0GLcZvOndGM1PGRbynoLqcQn31D3Ao0r',
//   port: 5432, // Puerto predeterminado de PostgreSQL
// });

const pg = require('pg');

config()

const conectar = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:true
})

// Función para conectar y manejar la lógica de conexión
async function conectarBaseDeDatos() {
    try {
      await conectar.connect();
      console.log('Conexión exitosa a PostgreSQL');
    } catch (error) {
      console.error('Error al conectar a PostgreSQL:', error.message);
    }
}

module.exports = {conectarBaseDeDatos , conectar}