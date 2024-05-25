function errors(code, status, message) {
    switch (code) {
        
        case '23514':
            status = 500;
            message = "Violación de restricción Check";
            break;
        case '42601':
            status = 500;
            message = "Error de Sintaxis, revise el código por favor";
            break;
        case '42703':
            status = 500;
            message = "Error de Sintaxis, columna no definida, revisar el código por favor";
            break;    
        case '23505':
            status = 400;
            message = "Ya existe la ID a ingresar";
            break;
        case '28P01':
            status = 400;
            message = "autentificacion password falló o no existe usuario: ";
            break;
        case '42P01':
            status = 400;
            message = "No existe la tabla consultada ";
            break;    
        case '3D000':
            status = 400;
            message = "Base de Datos a conectar no existe";
            break;
        case 'ENOTFOUND':
            status = 500;
            message = "Error en valor usado como localhost";
            break;
        case 'ECONNREFUSED':
            status = 500;
            message = "Error en el puerto de conexion a BD";
            break;
        case 'ERR_SOCKET_BAD_PORT':
            status = 500;
            message = "El puerto excede su valor";
            break;
        default:
            status = 500;
            message = "Error generico del Servidor";
            break;
    }
    
      return {code, status, message}
    }
    
    module.exports = errors;
