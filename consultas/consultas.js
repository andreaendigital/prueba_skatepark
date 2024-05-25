// // IMPORTANDO EL MANEJADOR DE ERRORES
const errors = require("../handleErrors/handleErrors.js");

// importando paquetes instalados necesarios
require("dotenv").config();

// importando lo que necesitas de conection.js, conexion a la BD
const { pool } = require("../database/connection.js");

//variables globales de index.js
let status = "";
let message = "";

//-------------------------------------------------------------------------------------------
//Función para consultar la base de datos y enlistar la tabla skaters exportarla como arreglo
const enlistarSkaters = async () => {
  try {
    const respuesta = await pool.query({
      text: "SELECT * FROM skaters",
    });
    if (respuesta.rowCount == 0){
        console.log("UPS! No existen registros de participantes. Agrega el primero!");
        return "UPS! No existen registros de participantes. Agrega el primero!";
    } else {
        console.log("Skaters registrados: ", respuesta.rows);
        return respuesta.rows;
    }
} catch (err) {
    console.log("Error General: ", err);
    const final = errors(err.code, message, status);
    console.log("Codigo de Error: ", final.code);
    console.log("Status de Error: ", final.status);
    console.log("Mensaje de Error: ", final.message);
    console.log("Error Original: ", err.message);
    return final;
  }
};

//-------------------------------------------------------------------------------------------
module.exports = {
enlistarSkaters
  }; //exporto la función
  