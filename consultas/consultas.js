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
    // console.log ("respuesta", respuesta);
    console.log ("respuesta", respuesta.rows);
    if (respuesta.rowCount == 0) {
      console.log(
        "UPS! No existen registros de participantes. Agrega el primero!"
      );
    //   return "UPS! No existen registros de participantes. Agrega el primero!";
    return [];  // Devuelve un arreglo vacío si no hay registros

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

    const [email, nombre, password, anos_experiencia, especialidad, foto] =
      datos; // Extraer datos del array datos

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
// Funcion para validar usuarios a la bd
async function validarSkater(email, password) {
  try {
    //contruyo el pool query y lo asigno a variable.
    console.log(
      "valores recibidos de email y password en funcion validar",
      email,
      password
    );
    const result = await pool.query({
      // construimos la instrucción y asignamos valores
      text: `SELECT id FROM skaters WHERE email = $1 AND password = $2`,
      values: [email, password],
    });
    console.log("resultado del await query consulta: ", result.rows);

    if (result.rowCount === 0) {
      console.log("Datos de acceso inválidos, por favor reintente.");
      return null;
    } else {
      const { id } = result.rows[0];
      return { id, email, password };
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
// Funcion para editar a usuario/skater
const editarSkater = async (id, nombre, anos_experiencia, especialidad) => {
  try {

    const result = await pool.query({
      text: `UPDATE skaters SET nombre = $2, anos_experiencia = $3, especialidad = $4 WHERE id = $1 RETURNING *;`,
      values: [id, nombre, anos_experiencia, especialidad],
    });
    console.log(
      `Skater ${nombre} con id ${id} y especialidad ${especialidad} actualizado con éxito`
    );
    console.log("Skater Editado: ", result.rows[0]);
    return {
      success: true,
      message: `El Skater ${nombre} ha actualizado sus datos correctamente.`,
    }; // Devuelve respuesta de actualización
  } catch (err) {
    console.log("Error General: ", err);
    const final = errors(err.code, message);
    console.log("Codigo de Error: ", final.code);
    console.log("Status de Error: ", final.status);
    console.log("Mensaje de Error: ", final.message);
    console.log("Error Original: ", err.message);
    return final;
  }
};

//-------------------------------------------------------------------------------------------
// Funcion para editar a usuario/skater
const cambiarEstado = async (id, estado) => {
  try {
    const result = await pool.query({
      text: `UPDATE skaters SET estado = $2 WHERE id = $1 RETURNING *;`,
      values: [id, estado],
    });
    console.log(`Skater con id ${id}, su estado actual es ${estado}`);
    console.log("Participante Editado: ", result.rows[0]);
    return {
      success: true,
      message: `El participante con id ${id}, ha cambiado su Estado.`,
    };
  } catch (err) {
    console.log("Error General: ", err);
    const final = errors(err.code, message);
    console.log("Codigo de Error: ", final.code);
    console.log("Status de Error: ", final.status);
    console.log("Mensaje de Error: ", final.message);
    console.log("Error Original: ", err.message);
    return final;
  }
};

//-------------------------------------------------------------------------------------------
// Funcion para eliminar a usuario/skater
const eliminar = async (id) =>{
    try {
        const result = await pool.query({
          text: `DELETE FROM skaters WHERE id = $1 RETURNING *;`,
          values: [id],
        });
        
        if (result.rowCount === 0) {
            // Maneja el caso cuando no se encuentra un registro con el ID proporcionado
            return { success: false, message: `No se encontró un participante con el ID ${id}` };
        }

        console.log(`Skater con id ${id}, eliminado correctamente`);
        console.log("Participante Eliminado en función eliminar ", result.rows[0]);
        return result.rows[0];
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
  validarSkater,
  editarSkater,
  cambiarEstado,
  eliminar
}; //exporto la función
