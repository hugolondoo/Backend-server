// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar Variables
var app = express();


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;
    console.log("Dababase connected: \x1b[32m%s\x1b[0m", "online");

});

// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'petición realizada correctamente'
    });

});


// Escuchar peticiones
app.listen(3000, () => {
    console.log("Express Server Run in 3000 port: \x1b[32m%s\x1b[0m", "online");
});