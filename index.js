// npm init --yes
// npm i express
// npm i expres-fileupload
// npm i pg
// npm i jsonwebtoken
// npm install --save express-handlebars
// npm install --save bootstrap
// npm i nodemon -D
// npm i morgan
// npm i dotenv
// abrir psql y crear database y table
// crear .env
// crear .gitignore

// Importaciones
const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");
const secretKey = "Skaters";
const dotenv = require("dotenv");
// const { skip } = require("node:test");
dotenv.config();

const app = express(); //instanciamos express
app.use(morgan("dev"));

// LEVANTANDO EL SERVIDOR
const PORT_SERVER = process.env.PORT_SERVER || 5000;

app.listen(PORT_SERVER, () => {
  console.log(`Servidor activo en el puerto http://localhost:${PORT_SERVER}`);
});

// Importado funciones  desde el módulo consultas.js
const {
  enlistarSkaters,
  insertar,
  validarSkater,
  editarSkater,
  cambiarEstado,
  eliminar,
} = require("./consultas/consultas.js");

// Middlewares -----------------------------------------------------------------------------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //para recibir desde el front (los objetos) como json

app.use(express.static(__dirname + "/public"));
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido",
  })
);
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

//definir handlebars como motor de plantillas
app.set("view engine", "handlebars"); // método set define configuración para ser utilizada por express

//configurar el motor de plantillas
app.engine(
  "handlebars", //extensión de archivos que identificará como vistas o layouts
  exphbs.engine({
    //método que recibe objeto de configuración con ruta donde tendre la svistas que se usarán
    defaultLayout: "main", // Plantilla principal
    // layoutsDir: `${__dirname}/views/mainLayout`,
    layoutsDir: __dirname + "/views", // Directorio de las plantillas principales
    // partialsDir: __dirname + '/views/componentes' // Directorio de los partials
  })
);

//RUTAS ASOCIADAS A LOS HANDLEBARS -------------------------------------------------------------------------

//ruta raíz del servidor, se define la vista que queremos renderizar y por defecto busca archivo main.handlebars
app.get("/", async (req, res) => {
  try {
    const skaters = await enlistarSkaters();
    if (skaters.length === 0) {
      res.status(401).send(`
        <script>
        alert("UPS! No existen registros de participantes. Agrega el primero.");
        window.location.href = "/registro";
        </script>
        `);
    }
    res.render("index", { skaters });
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.get("/admin", async (req, res) => {
  try {
    const skaters = await enlistarSkaters();
    console.log("skaters: ", skaters);
    if (skaters.length === 0) {
      res.status(401).send(`
            <script>
            alert("UPS! No existen registros de participantes. Agrega el primero.");
            window.location.href = "/registro";
            </script>
            `);
    }
    // Renderizar la página de registro normalmente si hay registros
    res.render("Admin", { skaters });
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

app.get("/datos", (req, res) => {
  res.render("Datos");
});

app.get("/login", (req, res) => {
  res.render("Login");
});

// app.get("/index", (req, res) => {
//     res.render("index");
// });

// app.get("/", (req, res) => {res.sendFile(__dirname + '/index.html')})


// Rutas de API REST de Skaters -----------------------------------------------------------------------------

app.get("/skaters", async (req, res) => {
  try {
    res.status(200).send(skaters);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//-------------------------------------------------------------------------------------------
//Ruta para agregar Usuarios a la lista:
app.post("/skaters", async (req, res) => {
  try {
    // console.log("body que llega: ", req.body);
    const { nombre, email, password, anos_experiencia, especialidad } =
      req.body; // Extraer los campos del cuerpo de la solicitud

    // Validar que los campos no estén vacíos

    if (!nombre || !email || !password || !anos_experiencia || !especialidad) {
      console.log("Todos los campos son requeridos para registrarse.");
      return res.status(401).send(`
            <script>
            alert("Todos los campos son requeridos para registrarse.");
            window.location.href = "/registro";
            </script>
            `);
    }

    console.log("Valor del req.body: ", req.body);

    // Validar que se adjunte archivo

    if (req.files == null) {
      console.log("No se encontro ningun archivo, adjunte foto por favor");
      return res.status(400).send(`
                <script>
                alert("No se encontro ningun archivo, adjunte foto por favor");
                window.location.href = "/registro";
                </script>
            `);
    }
    const { files } = req;
    const { foto } = files;
    const { name } = foto;
    const pathPhoto = `/uploads/${name}`;

    // Crea un array con los datos a enviar en la función
    const datosSkater = [
      email,
      nombre,
      password,
      anos_experiencia,
      especialidad,
      pathPhoto,
    ];

    // const datosSkater = req.body;
    console.log(
      "Valor del datosSkater array que rehago incluyendo pathPhoto ",
      datosSkater
    );
    console.log("Nombre de imagen: ", name);
    console.log("Ruta donde subir la imagen: ", pathPhoto);

    foto.mv(`${__dirname}/public${pathPhoto}`, async (err) => {
      try {
        //si hay error, retornar error
        if (err) throw err;
        //si no hay error, continuar:
        // datosSkater.foto = pathPhoto;
        const respuesta = await insertar(datosSkater);
        // console.log("respuesta de resgistro, post datosSkater: ", respuesta);
        // skaters.push(skater);
        res.status(201).redirect("/");
      } catch (error) {
        console.log(error.message);
        res.status(500).send({
          error: `Algo salió mal... ${error}`,
          code: 500,
        });
      }
    });
  } catch (error) {
    // console.log("Error: ", error);
    console.log("Error: ", error.message);
    res.status(500).send(error);
  }
});

//------------------------------------------------------------------------------------------------------------
//Ruta para ingresar al Login y generar Token:
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Valido que el email y el password se ingresen
  if (!email || !password) {
    return res.status(400).send({
      error: "Debe proporcionar el correo electrónico y la contraseña.",
      code: 400,
    });
  }

  try {
    //Validar si usuario/skater existe en la bbdd
    const skaterExiste = await validarSkater(email, password); // Llamada a la función de consulta bd para validar usuario
    console.log("Skater json stringify:", JSON.stringify(skaterExiste));
    console.log("Skater recibido :", skaterExiste);

    if (skaterExiste == null) {
      //Si no existe el usuario en la bbdd
      console.log(
        "Debe proporcionar todos los valores correctamente para ingresar."
      );

      return res.status(401).send({
        error:
          "Debe proporcionar todos los valores correctamente para ingresar.",
        code: 401,
      });
    } else if (skaterExiste.status == "500") {
      //Si la función devuelve un error 500
      console.log("Error en el servidor");

      return res.status(500).send({
        error: "Error en el servidor o error interno del programa",
        code: 500,
      });
    } else {
      //Si existe el usuario en la bbdd
      const token = jwt.sign(skaterExiste, secretKey); //Genero el token con los datos del skater
      console.log("Token creado:", token);

      res.status(200).send(token);
    } //envío el token como respuesta
  } catch (e) {
    console.log(e);
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//------------------------------------------------------------------------------------------------------------
//Ruta para ingresar al perfil:
app.get("/perfil", (req, res) => {
  const { token } = req.query;
  jwt.verify(token, secretKey, (err, skater) => {
    console.log("entre a verify del token");
    console.log("variable skater del token: ", skater);

    if (err) {
      res.status(500).send({
        error: `Algo salió mal...`,
        message: err.message,
        code: 500,
      });
    } else {
      res.render("Datos", { skater });
    }
  });
});

//------------------------------------------------------------------------------------------------------------
//Ruta para editar el perfil
app.put("/skaters", async (req, res) => {
  //   console.log("Cuerpo de la solicitud:", req.body);
  //   console.log("Valor del body, editando skater: ", id, nombre, anos_experiencia, especialidad);

  try {
    const { id, nombre, anos_experiencia, especialidad } = req.body;
    if (!nombre || !anos_experiencia || !especialidad) {
      console.log("Todos los campos son requeridos para registrarse.");
      //  return      res.status(400).send("Todos los campos son requeridos para registrase");

      return res.send(`
                  <script>
                  alert("Todos los campos son requeridos para registrarse.");
                  window.location.reload();
                  </script>
                  `);
    }
    const skaterEditado = await editarSkater(
      id,
      nombre,
      anos_experiencia,
      especialidad
    );
    return res.send(`
                <script>
                alert("${skaterEditado.message}");
                window.location.href = '${"/"}';
                </script>
            `);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//------------------------------------------------------------------------------------------------------------
//Ruta para cambiar status del perfil
app.put("/skaters/status/:id", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  console.log("Valor de estado recibido por req.body: ", estado);
  try {
    const estadoCambiado = cambiarEstado(id, estado);
    return res.send(`
                <script>
                alert("${estadoCambiado.message}");
                window.location.href = '${"/"}';
                </script>
            `);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//------------------------------------------------------------------------------------------------------------
//Ruta para Eliminar un registro
app.delete("/skaters/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const skaterEliminado = eliminar(id);
    console.log("Participante Eliminado en ruta delete:", skaterEliminado);

    if (skaterEliminado !== -1) {
      //si devuelve un índice
      res.status(200).send("Skater Eliminado con éxito");
    } else {
      res.status(400).send("No existe este Skater"); //si entrega el array -1 , el skater no existe
    }
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal... ${e}`,
      code: 500,
    });
  }
});

//------------------------------------------------------------------------------------------------------------
// Ruta genérica para manejar solicitudes a rutas no existentes
app.get("*", (req, res) => {
  //res.status(404).send("La ruta solicitada no existe en el servidor.");
  return res.send(`
    <script>
    alert("Esta pagina no existe");
    window.location.href = '${"/"}';
    </script>
    `);
});
