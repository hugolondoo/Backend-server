var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


var mdAutenticacion = require('../middlewares/autenticacion');

app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); // 4 Horas  de expiración
    res.status(200).json({
        ok: true,
        token: token
    });
});


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, UsuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!UsuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, UsuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token
        UsuarioBD.password = ':)';
        var token = jwt.sign({ usuario: UsuarioBD }, SEED, { expiresIn: 14400 }); // 4 Horas  de expiración

        res.status(200).json({
            ok: true,
            usuario: UsuarioBD,
            token: token,
            id: UsuarioBD._id,
            menu: obtenerMenu(UsuarioBD.role)
        });

    });


});

function obtenerMenu(ROLE) {
    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Progressbar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' },

            ]
        }
    ];
    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}


module.exports = app;