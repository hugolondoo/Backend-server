// Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

// Inicializar Variables
var app = express();

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar Rutas
var appRoutes = require("./routes/app");
var userRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");

// Conexión a la base de datos
mongoose.connection.openUri(
    "mongodb://localhost:27017/hospitalDB",
    (err, res) => {
        if (err) throw err;
        console.log("Dababase connected: \x1b[32m%s\x1b[0m", "online");
    }
);

// Rutas
app.use("/usuario", userRoutes);
app.use("/login", loginRoutes);
app.use("/", appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log("Express Server Run in 3000 port: \x1b[32m%s\x1b[0m", "online");
});