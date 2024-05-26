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
    if (respuesta.rowCount == 0) {
      console.log(
        "UPS! No existen registros de participantes. Agrega el primero!"
      );
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
// Funcion para insertar usuarios a la bd
async function insertar(datos) {
  try {
    //insertar recibe el array datos:
    //   console.log("Valores recibidos: ", datos);

    const [email, nombre, password, anos_experiencia, especialidad, foto] = datos; // Extraer datos del array datos
  
    //contruyo el pool query y lo asigno a variable.
    const result = await pool.query({
      // construimos la instrucción y asignamos valores
      text: "INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      values: [
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        foto,
        false,
      ],
    });
    //para saber lo que me responde la instrucción:
    //console.log("valor de result :", result);
    //Respuesta de la función: return result.rows[0];
    if (result.rows != 0) {
      //si el número de filas es distinto a cero, mostrar el mensaje:
      console.log("Número de Usuarios agregados:", result.rowCount);
      //Valor del result o del registro agregado:
      console.log("Usuario Agregado ", result.rows[0]);
      return result.rows[0];
    } else {
      //si hay 0 filas mostrar mensaje:
      console.log("No se han agregado usuarios");
      return "No se han agregado usuarios";
    }
  } catch (err) {
    console.log("Error General: ", err);
    const final = errors(err.code, message);
    console.log("Codigo de Error: ", final.code);
    console.log("Status de Error: ", final.status);
    console.log("Mensaje de Error: ", final.message);
    console.log("Error Original: ", err.message);
    return final;
  }
}

//-------------------------------------------------------------------------------------------
module.exports = {
  enlistarSkaters,
  insertar,
}; //exporto la función
