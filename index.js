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
    enlistarSkaters
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
    exphbs.engine({ //método que recibe objeto de configuración con ruta donde tendre la svistas que se usarán
        defaultLayout: "main", // Plantilla principal
        // layoutsDir: `${__dirname}/views/mainLayout`,
        layoutsDir:__dirname + "/views", // Directorio de las plantillas principales
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
        res.render("index", {skaters});
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
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
            code: 500
        })
    };
});