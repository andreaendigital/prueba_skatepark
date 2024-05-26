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
const { enlistarSkaters, insertar } = require("./consultas/consultas.js");

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
// app.get("/", (req, res) => {
//     res.render("main");
// });

app.get("/", async (req, res) => {
  try {
    const skaters = await enlistarSkaters();
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

app.get("/admin", (req, res) => {
  res.render("Admin");
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
//por defecto, los partials son buscados en "partials" dentro de views, porciones de código que se invocan con dobles llaves {{>meunu}}

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
    console.log("Valor del req.body: ", req.body);

    // Validar que los campos no estén vacíos
    if (nombre == "" || email == "") {
      console.log("Todos los campos son requeridos.");
      return res.status(400).json({
        error: "Todos los campos son requeridos.",
      });
    }

    if (Object.keys(req.files).length == 0) {
      return res
        .status(400)
        .send("No se encontro ningun archivo en la consulta");
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

    //    // Validar que el campo 'balance' sea un número
    //    if (anos_experiencia == null) {
    //     console.log("El campo 'balance' debe ser un número.");
    //     return res.status(400).json({
    //       error: "El campo 'balance' debe ser un número.",
    //     });
    //   }
  } catch (error) {
    // console.log("Error: ", error);
    console.log("Error: ", error.message);
    res.status(500).send(error);
  }
});